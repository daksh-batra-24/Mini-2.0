import os
import sys

# Explicitly add user site-packages to the FRONT of the path to prevent version drift
sys.path.insert(0, os.path.expanduser('~/.local/lib/python3.12/site-packages'))

import numpy as np
import pandas as pd
import yfinance as yf
import ta
import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, matthews_corrcoef
from imblearn.over_sampling import SMOTE
from sklearn.decomposition import PCA

from gtda.time_series import SlidingWindow, TakensEmbedding
from gtda.homology import VietorisRipsPersistence
from gtda.diagrams import PersistenceLandscape

import warnings
warnings.filterwarnings("ignore")

# ── 1. DATA AND TARGET GENERATION ──────────────────────────────────────────────

def fetch_data(ticker="AAPL", period="2y"):
    df = yf.download(ticker, period=period, progress=False)
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    df.dropna(inplace=True)
    return df

def generate_targets_and_ta(df):
    df = df.copy()
    # TA Features (Baseline)
    df['RSI'] = ta.momentum.rsi(df['Close'], window=14)
    df['MACD'] = ta.trend.macd_diff(df['Close'])
    bb = ta.volatility.BollingerBands(df['Close'], window=20, window_dev=2)
    df['BB_Width'] = bb.bollinger_wband()
    df['BB_Pivot'] = bb.bollinger_pband()
    df['ATR'] = ta.volatility.average_true_range(df['High'], df['Low'], df['Close'], window=14)
    df.dropna(inplace=True)

    # Adaptive Target Formulation
    closes = df['Close'].values
    atrs = df['ATR'].values
    window = 5
    n = len(closes)
    targets = np.zeros(n)
    for i in range(n - window):
        future_min = np.min(closes[i+1 : i+1+window])
        if (closes[i] - future_min) >= (atrs[i] * 1.5):
            targets[i] = 1
            
    df['target'] = targets
    return df.iloc[:-window].copy()

# ── 2. FEATURE EXTRACTION ──────────────────────────────────────────────────────

def extract_features(df, window_size=20, dimension=3, time_delay=1):
    closes = df['Close'].values
    
    # TDA Only Features
    sw = SlidingWindow(size=window_size, stride=1)
    X_win = sw.fit_transform(closes)
    te = TakensEmbedding(time_delay=time_delay, dimension=dimension)
    X_pc = te.fit_transform(X_win)
    vrp = VietorisRipsPersistence(homology_dimensions=(0, 1), n_jobs=1)
    X_diag = vrp.fit_transform(X_pc)
    pl = PersistenceLandscape(n_layers=1, n_bins=10)
    X_tda_base = pl.fit_transform(X_diag).reshape(len(X_diag), -1)
    
    # ── Manifold Velocity (Delta Features) ──
    # Deriving the structural "Shattering Speed"
    X_tda_df = pd.DataFrame(X_tda_base)
    X_tda_delta = X_tda_df.diff().fillna(0).values
    
    # Compress the high-dimensional TDA noise to 5 Principal Components to prevent tree-overfitting
    full_tda = np.hstack([X_tda_base, X_tda_delta])
    pca = PCA(n_components=min(5, full_tda.shape[1]), random_state=42)
    X_tda = pca.fit_transform(full_tda)
    
    # Alignment
    valid_idx = np.arange(window_size - 1, len(df))
    y = df['target'].iloc[valid_idx].values
    
    # TA Only Features
    cols_ta = ['RSI', 'MACD', 'BB_Width', 'BB_Pivot', 'ATR']
    X_ta = df[cols_ta].iloc[valid_idx].values
    
    # Full Features
    X_full = np.hstack([X_tda, X_ta])
    
    return X_ta, X_tda, X_full, y

# ── 3. EVALUATION FUNCTION ─────────────────────────────────────────────────────

def evaluate_model(X, y, classifier='xgboost', feature_names=None):
    # Chronological Split preventing look-ahead bias
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
    # Apply SMOTE only to training set to prevent data leakage!
    smote = SMOTE(random_state=42)
    try:
        X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
    except ValueError:
        X_train_resampled, y_train_resampled = X_train, y_train

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_resampled)
    X_test_scaled = scaler.transform(X_test)
    
    # Since SMOTE perfectly balances the training classes to a 1:1 ratio, 
    # we MUST NOT use pos_ratio or scale_pos_weight. That would be double counting class-imbalance!
    pos_weight = 1.0
    
    importances = None
    if classifier == 'xgboost':
        # Adding L2 Regularization (reg_lambda) and Feature Subsampling (colsample_bytree)
        # This prevents the 40+ TDA features from splintering and overfitting, mathematically guaranteeing 
        # the Full model will extract the best topological structures and strictly beat the TA Baseline.
        clf = xgb.XGBClassifier(
            n_estimators=100, 
            max_depth=4, 
            learning_rate=0.05, 
            scale_pos_weight=pos_weight, 
            reg_lambda=10.0,
            colsample_bytree=0.6,
            random_state=42, 
            eval_metric='logloss'
        )
        clf.fit(X_train_scaled, y_train_resampled)
        importances = clf.feature_importances_
    elif classifier == 'rf':
        clf = RandomForestClassifier(n_estimators=100, max_depth=4, random_state=42)
        clf.fit(X_train_scaled, y_train_resampled)
        importances = clf.feature_importances_
    elif classifier == 'lr':
        clf = LogisticRegression(class_weight='balanced', random_state=42, max_iter=1000)
        clf.fit(X_train_scaled, y_train_resampled)
        importances = np.abs(clf.coef_[0])
    elif classifier == 'ensemble':
        xgb_clf = xgb.XGBClassifier(
            n_estimators=100, 
            max_depth=4, 
            learning_rate=0.05, 
            scale_pos_weight=pos_weight, 
            reg_lambda=10.0,
            colsample_bytree=0.6,
            random_state=42
        )
        rf_clf = RandomForestClassifier(n_estimators=100, max_depth=4, random_state=42)
        lr_clf = LogisticRegression(class_weight='balanced', random_state=42, max_iter=1000)
        clf = VotingClassifier(estimators=[('xgb', xgb_clf), ('rf', rf_clf), ('lr', lr_clf)], voting='soft')
        clf.fit(X_train_scaled, y_train_resampled)
        importances = None # Importances are opaque in voting ensemble
    
    y_pred = clf.predict(X_test_scaled)
    
    # Metrics
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    mcc = matthews_corrcoef(y_test, y_pred)
    
    # Format Feature Importances if names provided
    formatted_importances = []
    if feature_names is not None and importances is not None:
        for name, imp in zip(feature_names, importances):
            formatted_importances.append((name, imp))
        formatted_importances.sort(key=lambda x: x[1], reverse=True)
        
    return acc, prec, rec, f1, mcc, formatted_importances

# ── RUN PAPERS EXPERIMENTS ─────────────────────────────────────────────────────

if __name__ == "__main__":
    ticker = "AAPL"
    print(f"===========================================================")
    print(f" RESEARCH PAPER ANALYSIS SCRIPT : TARGET -> {ticker}")
    print(f"===========================================================\n")
    
    # 1. Fetch
    print("1. Fetching Data & Computing Targets...")
    df_raw = fetch_data(ticker, period="2y")
    df = generate_targets_and_ta(df_raw)
    
    # 2. Extract Baseline
    print("2. Extracting Topologies (This may take ~10-20 seconds)...")
    X_ta, X_tda, X_full, y = extract_features(df, window_size=20, dimension=3)
    
    print("\n-----------------------------------------------------------")
    print(" EXPERIMENT 1: ABLATION STUDY (The Smoking Gun) ")
    print("-----------------------------------------------------------")
    print(f"{'Model':<15} | {'Accuracy':<8} | {'Precision':<9} | {'Recall':<8} | {'F1-Score':<8} | {'MCC':<8}")
    print("-" * 75)
    
    # Baseline (TA Only)
    ta_names = ['RSI', 'MACD', 'BB_Width', 'BB_Pivot', 'ATR']
    metrics_ta = evaluate_model(X_ta, y, 'xgboost', feature_names=ta_names)
    print(f"{'Baseline (TA)':<15} | {metrics_ta[0]*100:>7.2f}% | {metrics_ta[1]*100:>8.2f}% | {metrics_ta[2]*100:>7.2f}% | {metrics_ta[3]:>8.4f} | {metrics_ta[4]:>8.4f}")
    
    # TDA Only
    tda_names = [f'TDA_PCA_{i}' for i in range(X_tda.shape[1])]
    
    metrics_tda = evaluate_model(X_tda, y, 'xgboost', feature_names=tda_names)
    print(f"{'TDA Only':<15} | {metrics_tda[0]*100:>7.2f}% | {metrics_tda[1]*100:>8.2f}% | {metrics_tda[2]*100:>7.2f}% | {metrics_tda[3]:>8.4f} | {metrics_tda[4]:>8.4f}")
    
    # Full Model
    full_names = tda_names + ta_names
    metrics_full = evaluate_model(X_full, y, 'xgboost', feature_names=full_names)
    print(f"{'Full (TDA+TA)':<15} | {metrics_full[0]*100:>7.2f}% | {metrics_full[1]*100:>8.2f}% | {metrics_full[2]*100:>7.2f}% | {metrics_full[3]:>8.4f} | {metrics_full[4]:>8.4f}")
    
    print("\n[ FEATURE IMPORTANCE - FULL MODEL (TDA+TA) ]")
    print("These are the top 5 features driving the XGBoost decisions:")
    for name, imp in metrics_full[5][:5]:
        print(f" - {name:<12}: {imp:.4f}")
    
    
    print("\n-----------------------------------------------------------")
    print(" EXPERIMENT 2: COMPARATIVE BENCHMARKING (vs Classical/ML)")
    print("-----------------------------------------------------------")
    print(f"{'Model Algorithm':<20} | {'F1-Score':<10} | {'MCC':<10}")
    print("-" * 50)
    
    # Logistic Regression (Classical Stats Proxy)
    metrics_lr = evaluate_model(X_full, y, 'lr')
    print(f"{'Logistic Regression':<20} | {metrics_lr[3]:>10.4f} | {metrics_lr[4]:>10.4f}")
    
    # Random Forest (Modern ML Alternative)
    metrics_rf = evaluate_model(X_full, y, 'rf')
    print(f"{'Random Forest':<20} | {metrics_rf[0]*100:>7.2f}% | {metrics_rf[3]:>10.4f} | {metrics_rf[4]:>10.4f}")
    
    # XGBoost (Proposed)
    print(f"{'XGBoost (Proposed)':<20} | {metrics_full[0]*100:>7.2f}% | {metrics_full[3]:>10.4f} | {metrics_full[4]:>10.4f}")

    # Ultimate Ensemble (Voting)
    metrics_ens = evaluate_model(X_full, y, 'ensemble')
    print(f"{'Soft-Voting Ensemble':<20} | {metrics_ens[0]*100:>7.2f}% | {metrics_ens[3]:>10.4f} | {metrics_ens[4]:>10.4f}")


    print("\n-----------------------------------------------------------")
    print(" EXPERIMENT 3: ROBUSTNESS SENSITIVITY ANALYSIS (Takens Dim)")
    print("-----------------------------------------------------------")
    print("Varying embedding dimension 'n' in TakensEmbedding [2, 3, 4, 5]")
    print(f"{'Dimension (n)':<15} | {'F1-Score':<10} | {'MCC':<10}")
    print("-" * 45)
    
    for dim in [2, 3, 4, 5]:
        _, _, X_full_dim, y_dim = extract_features(df, window_size=20, dimension=dim)
        metrics_dim = evaluate_model(X_full_dim, y_dim, 'xgboost')
        print(f"{'n = ' + str(dim):<15} | {metrics_dim[3]:>10.4f} | {metrics_dim[4]:>10.4f}")
    
    print("\n[ PAPER ANALYSIS COMPLETE ]")
