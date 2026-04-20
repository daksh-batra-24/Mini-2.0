import numpy as np
import yfinance as yf
import pandas as pd
import ta
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from gtda.time_series import SlidingWindow, TakensEmbedding
from gtda.homology import VietorisRipsPersistence
from gtda.diagrams import PersistenceLandscape

def add_technical_features(df):
    df = df.copy()
    df['RSI'] = ta.momentum.rsi(df['Close'], window=14)
    df['MACD'] = ta.trend.macd_diff(df['Close'])
    bb = ta.volatility.BollingerBands(df['Close'], window=20, window_dev=2)
    df['BB_Width'] = bb.bollinger_wband()
    df['BB_Pivot'] = bb.bollinger_pband()
    df['ATR'] = ta.volatility.average_true_range(df['High'], df['Low'], df['Close'], window=14)
    df.dropna(inplace=True)
    return df

df = yf.download("TATASTEEL.NS", period="2y", progress=False)
df.columns = df.columns.get_level_values(0)

# Target
df['ATR'] = ta.volatility.average_true_range(df['High'], df['Low'], df['Close'], window=14)
df.dropna(inplace=True)
closes = df['Close'].values
atrs = df['ATR'].values
window = 5
targets = np.zeros(len(closes))
for i in range(len(closes) - window):
    drop_abs = closes[i] - np.min(closes[i+1:i+1+window])
    if drop_abs >= (atrs[i] * 1.5):
        targets[i] = 1
df['target'] = targets
df = df.iloc[:-window].copy()

# Features
df_ta = add_technical_features(df)
sw = SlidingWindow(size=20, stride=1)
X_win = sw.fit_transform(df_ta['Close'].values)
te = TakensEmbedding(time_delay=1, dimension=3)
X_pc = te.fit_transform(X_win)
vrp = VietorisRipsPersistence(homology_dimensions=(0, 1))
X_diag = vrp.fit_transform(X_pc)
pl = PersistenceLandscape(n_layers=1, n_bins=10)
X_tda = pl.fit_transform(X_diag).reshape(len(X_diag), -1)

valid_idx = np.arange(19, len(df_ta))
X_ta = df_ta[['RSI', 'MACD', 'BB_Width', 'BB_Pivot', 'ATR']].iloc[valid_idx].values
X = np.hstack([X_tda, X_ta])
y = df_ta['target'].iloc[valid_idx].values

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

clf = xgb.XGBClassifier(
    n_estimators=50, max_depth=3, learning_rate=0.05, 
    scale_pos_weight=(np.sum(y_train==0)/np.sum(y_train==1)) if np.sum(y_train==1)>0 else 1,
    random_state=42
)
clf.fit(X_train, y_train)
acc = accuracy_score(y_test, clf.predict(X_test))
print(f"Test Accuracy: {acc*100:.2f}%")
