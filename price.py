import pandas_datareader.data as web
import numpy as np
import pandas as pd
import scipy.io as spio
#pd.core.common.is_list_like = pd.api.types.is_list_like
from pandas_datareader import data as pdr
import fix_yahoo_finance as yf
yf.pdr_override()
import datetime
import matplotlib.pyplot as plt
import warnings
from scipy import stats
warnings.filterwarnings("ignore")
import re
import os

# abspath = os.path.abspath(__file__)
# dname = os.path.dirname(abspath)
# os.chdir(dname)
os.chdir('/Users/jeremylongfellow/Documents')
# os.getcwd()

def getDataBatch(tickers, startdate, enddate):
  def getData(ticker):
    return (pdr.get_data_yahoo(ticker, start=startdate, end=enddate))
  datas = map(getData, tickers)
  return(pd.concat(datas, keys=tickers, names=['Ticker', 'Date']))
# define the time period
while True:
    start_dt = datetime.datetime(2013, 11, 10)
    end_dt = datetime.datetime.today().strftime('%Y-%m-%d')

    # for multiple stock cases
    tickers = ['GOOGL', 'AMZN', 'FB', 'MNST', 'BIIB', '^GSPC']
    stock_data = getDataBatch(tickers, start_dt, end_dt)
    # Isolate the `Adj Close` values and transform the DataFrame
    daily_close_px = stock_data.reset_index().pivot(index='Date', columns='Ticker', values='Adj Close')
    # calculate the historical daily returns of each stocks and the portfolio
    daily_pct_change = daily_close_px.pct_change().dropna()

    sigma = daily_pct_change.std(ddof = 1)*(252**0.5)
    S0 = daily_close_px.iloc[-1,]
    K_min = round(S0 - 0.5*sigma*S0)
    two_sigma = 0.05*sigma*S0

    Rf = 0.0274
    t = 2
    final_df = pd.DataFrame()
    for x in tickers:
        K_values = []
        call = []
        put = []
        for i in range(0, 20):
            K = int(round(K_min + i * two_sigma)[x])
            S = S0[x]
            d1 = (np.log(S/K) + (Rf + sigma[x]**2/2)*t)/(sigma[x]*np.sqrt(t))
            d2 = d1 - sigma[x]*np.sqrt(t)
            c = int(round(S * stats.norm.cdf(d1) - stats.norm.cdf(d2)* K * np.exp(-Rf*t)))
            p = int(round(stats.norm.cdf(-d2)* K * np.exp(-Rf*t) - S * stats.norm.cdf(-d1)))
            K_values.append(K)
            call.append(c)
            put.append(p)
        final_T = pd.DataFrame(np.repeat(x, 20), columns = ['Ticker'])
        final_K = pd.DataFrame(K_values, columns = ['K'])
        final_C = pd.DataFrame(call, columns = ['Call'])
        final_P = pd.DataFrame(put, columns = ['Put'])
        temp_df = pd.concat([final_T, final_K, final_C, final_P], axis = 1)
        final_df = pd.concat([final_df, temp_df], axis = 0)

    pd.DataFrame.to_json(final_df, orient = 'table', index = False)
    json = final_df.to_json(orient = 'table', index = False)
    json_revised = json.split('data":')[1]
    json_file = open("prices.json", "w")
    json_file.write(json_revised[:-1])
    json_file.close()
time.sleep(300)