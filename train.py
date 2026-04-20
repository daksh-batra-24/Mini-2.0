import os
import json
import numpy as np
import pandas as pd
import yfinance as yf
import ta
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import xgboost as xgb

try:
    from gtda.time_series import SlidingWindow, TakensEmbedding
    from gtda.homology import VietorisRipsPersistence
    from gtda.diagrams import PersistenceLandscape
except ImportError:
    print("Warning: giotto-tda is not installed. Please install it using 'pip install giotto-tda'")


def fetch_data(ticker="SPY", period="5y"):
    """Fetch OHLCV data using yfinance and calculate daily returns."""
    print(f"Fetching {period} data for {ticker}...")
    df = yf.download(ticker, period=period, progress=False)
    
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
        
    df['Returns'] = df['Close'].pct_change()
    df.dropna(inplace=True)
    return df


def create_target(df, window=5, atr_multiplier=1.5):
    """
    Creates an Adaptive Target based on ATR (Average True Range).
    target = 1 if the stock's closing price drops by more than `atr_multiplier * ATR`
    at any point in the next `window` trading days, 0 otherwise.
    """
    df = df.copy()
    
    # 1. Calculate 14-day ATR (Average True Range)
    df['ATR'] = ta.volatility.average_true_range(df['High'], df['Low'], df['Close'], window=14)
    # Forward fill or drop ATR NaNs
    df.dropna(inplace=True)
    
    closes = df['Close'].values
    atrs = df['ATR'].values
    n = len(closes)
    targets = np.zeros(n)
    
    # 2. Look ahead to find drawdowns normalized by volatility
    for i in range(n - window):
        future_window = closes[i+1 : i+1+window]
        min_future_close = np.min(future_window)
        # Absolute drop
        drop_abs = closes[i] - min_future_close 
        
        # If the drop is greater than (ATR * multiplier), it's a structural crash for this stock
        if drop_abs >= (atrs[i] * atr_multiplier):
            targets[i] = 1
            
    df['target'] = targets
    
    # Trim the last `window` rows because their future is unknown
    df = df.iloc[:-window].copy()
    return df


def add_technical_features(df):
    """Inject traditional momentum and volatility context."""
    df = df.copy()
    
    # Momentum
    df['RSI'] = ta.momentum.rsi(df['Close'], window=14)
    df['MACD'] = ta.trend.macd_diff(df['Close'])
    
    # Volatility Edge Cases
    bb = ta.volatility.BollingerBands(df['Close'], window=20, window_dev=2)
    df['BB_Width'] = bb.bollinger_wband()
    df['BB_Pivot'] = bb.bollinger_pband()
    
    # Drop NAs created by indicators
    df.dropna(inplace=True)
    return df


def extract_combined_features(df, window_size=20, time_delay=1, dimension=3):
    """
    Feature Fusion: TDA (Structure) + TA (Momentum)
    Returns: X matrix and y targets perfectly aligned.
    """
    df = add_technical_features(df)
    closes = df['Close'].values
    
    # --- 1. TDA extraction ---
    sw = SlidingWindow(size=window_size, stride=1)
    X_windows = sw.fit_transform(closes) 
    
    te = TakensEmbedding(time_delay=time_delay, dimension=dimension)
    X_point_clouds = te.fit_transform(X_windows)
    
    vrp = VietorisRipsPersistence(homology_dimensions=(0, 1))
    X_diagrams = vrp.fit_transform(X_point_clouds)
    
    pl = PersistenceLandscape(n_layers=1, n_bins=10)
    X_tda = pl.fit_transform(X_diagrams)
    X_tda = X_tda.reshape(X_tda.shape[0], -1)
    
    # --- 2. Align Traditional Features ---
    # The TDA sliding window consumes `window_size - 1` historical days before emitting the first feature.
    # Therefore, the corresponding "current day" for the first window is index `window_size - 1`
    valid_idx = np.arange(window_size - 1, len(df))
    
    # Extract traditional features solely for the valid days
    cols_ta = ['RSI', 'MACD', 'BB_Width', 'BB_Pivot', 'ATR']
    X_ta = df[cols_ta].iloc[valid_idx].values
    
    # Feature Fusion
    X_fused = np.hstack([X_tda, X_ta])
    y_aligned = df['target'].iloc[valid_idx].values
    
    return X_fused, y_aligned


def main():
    os.makedirs('models', exist_ok=True)
    
    # 1. Multi-Asset Training Basket
    # Mixing low-volatility ETFs with highly volatile Indian equities
    symbols = ['SPY', 'QQQ', 'RELIANCE.NS', 'TATASTEEL.NS', 'NVDA']
    
    all_X = []
    all_y = []
    
    for sym in symbols:
        try:
            df = fetch_data(sym, period='5y')
            # Adaptive Target based on the specific asset's ATR
            df = create_target(df, window=5, atr_multiplier=1.5)
            # Fused Extraction
            X, y = extract_combined_features(df, window_size=20)
            
            all_X.append(X)
            all_y.append(y)
        except Exception as e:
            print(f"Skipping {sym} due to error: {e}")
            
    # Concatenate universally
    X = np.vstack(all_X)
    y = np.concatenate(all_y)
    
    print(f"\nUniversal Dataset size: {X.shape[0]} samples across {len(all_X)} assets.")
    print(f"Global Class split -> 0 (Normal): {np.sum(y == 0)}, 1 (Volatility Crash): {np.sum(y == 1)}")
    
    # 2. Chronological Split (Train 80%, Test 20%)
    # We should split each asset chronologically, but stack acts slightly out of order chronologically globally.
    # To be extremely pedantic on chronological splits, normally we'd split per asset, then stack.
    # For speed here, we just split the stacked array. Since it comprises contiguous blocks of 5y data,
    # the 80/20 split will test heavily on the last asset, which is a bit biased. Let's do it right:
    
    X_train_list, X_test_list, y_train_list, y_test_list = [], [], [], []
    for asset_X, asset_y in zip(all_X, all_y):
        split = int(len(asset_X) * 0.8)
        X_train_list.append(asset_X[:split])
        X_test_list.append(asset_X[split:])
        y_train_list.append(asset_y[:split])
        y_test_list.append(asset_y[split:])
        
    X_train = np.vstack(X_train_list)
    X_test = np.vstack(X_test_list)
    y_train = np.concatenate(y_train_list)
    y_test = np.concatenate(y_test_list)
    
    # 3. Scale Features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 4. Train xgboost Model
    print("\nTraining Universal XGBoost Classifier...")
    num_neg = np.sum(y_train == 0)
    num_pos = np.sum(y_train == 1)
    scale_pos_weight = (num_neg / num_pos) * 0.2 if num_pos > 0 else 1.0

    clf = xgb.XGBClassifier(
        n_estimators=150,
        max_depth=5,
        learning_rate=0.03,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        eval_metric='logloss',
        subsample=0.8,
        colsample_bytree=0.8
    )
    clf.fit(X_train_scaled, y_train)
    
    # 5. Evaluate
    y_pred = clf.predict(X_test_scaled)
    report_text = classification_report(y_test, y_pred)
    
    cm = confusion_matrix(y_test, y_pred).tolist()
    metrics = {
        "ticker_trained_on": ", ".join(symbols),
        "training_period": "5y",
        "total_samples": int(len(X)),
        "class_distribution": {
            "normal": int(np.sum(y == 0)),
            "drawdown": int(np.sum(y == 1)),
        },
        "overall_accuracy": round(accuracy_score(y_test, y_pred), 4),
        "class_1_drawdown": {
            "precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
            "recall": round(recall_score(y_test, y_pred, zero_division=0), 4),
            "f1_score": round(f1_score(y_test, y_pred, zero_division=0), 4),
        },
        "confusion_matrix": {
            "true_neg": cm[0][0], "false_pos": cm[0][1],
            "false_neg": cm[1][0] if len(cm)>1 else 0, "true_pos": cm[1][1] if len(cm)>1 else 0
        },
    }
    
    print("\nSaving universally-trained model, scaler, and metrics...")
    joblib.dump(clf, 'models/xgboost_tda.joblib')
    joblib.dump(scaler, 'models/feature_scaler.joblib')
    with open('models/metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
        
    print(f"\n{'='*50}")
    print(f"  Universal Accuracy : {metrics['overall_accuracy']*100:.1f}%")
    print(f"  Drawdown Recall    : {metrics['class_1_drawdown']['recall']*100:.1f}%")
    print(f"  Drawdown Precision : {metrics['class_1_drawdown']['precision']*100:.1f}%")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
