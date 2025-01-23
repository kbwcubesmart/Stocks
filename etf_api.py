from flask import Flask, jsonify
from flask_cors import CORS
import yfinance as yf

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Define CUSIP mapping
cusip_mapping = (
    "NVDA", "AAPL", "MSFT", "GOOG", "AMZN", "GOOGL", "META", "TSLA", "AVGO", "BRK.B",
    "WMT", "JPM", "LLY", "V", "XOM", "MA", "UNH", "ORCL", "COST", "HD", "PG", "NFLX",
    "JNJ", "BAC", "CRM", "ABBV", "CVX", "KO", "WFC", "TMUS", "MRK", "CSCO", "NOW",
    "AXP", "ACN", "BX", "MS", "TMO", "ISRG", "GS", "LIN", "IBM", "PEP", "GE", "ABT",
    "MCD", "AMD", "DIS", "PM", "CAT", "ADBE", "QCOM", "TXN", "DHR", "INTU", "RTX",
    "PLTR", "VZ", "T", "SPGI", "AMAT", "BLK", "BKNG", "C", "ANET", "PFE", "SYK",
    "LOW", "BSX", "SCHW", "AMGN", "HON", "NEE", "UNP", "KKR", "UBER", "CMCSA", "ETN",
    "PGR", "TJX", "COP", "BA", "DE", "MU", "ADP", "PANW", "LMT", "FI", "GILD", "BMY",
    "GEV", "UPS", "MDT", "SBUX", "PLD", "VRTX", "ADI", "CB", "NKE", "MMC", "LRCX",
    "KLAC", "CEG", "APO", "INTC", "SO", "SHW", "ELV", "CRWD", "EQIX", "PYPL", "TT",
    "AMT", "MCO", "APH", "PH", "MO", "ICE", "DUK", "WM", "CDNS", "CME", "WELL", "ABNB",
    "SNPS", "CTAS", "HCA", "CI", "MMM", "AON", "PNC", "MSI", "DELL", "ITW", "MAR",
    "MDLZ", "USB", "CMG", "TDG", "EOG", "ZTS", "GD", "FTNT", "MCK", "AJG", "REGN",
    "WMB", "EMR", "COF", "NOC", "CL", "ORLY", "APD", "BDX", "KMI", "ECL", "RSG",
    "CVS", "WDAY", "FDX", "SPG", "RCL", "OKE", "CSX", "ADSK", "CARR", "VST", "TFC",
    "TGT", "DLR", "SLB", "BK", "HLT", "MET", "GM", "AFL", "FCX", "PCAR", "NSC", "ROP",
    "CHTR", "CPRT", "AZO", "SRE", "GWW", "JCI", "NXPI", "TRV", "AMP", "PWR", "PAYX",
    "PSA", "AEP", "URI", "FANG", "HWM", "CMI", "ALL", "PSX", "ROST", "O", "MPC",
    "MSCI", "MNST", "NEM", "DFS", "OXY", "TRGP", "COR", "D", "AIG", "BKR", "AXON",
    "FICO", "DHI", "NDAQ", "HES", "LULU", "PEG", "TEL", "VLO", "GLW", "DAL", "FAST",
    "A", "CTVA", "KDP", "PRU", "AME", "KR", "FIS", "CBRE", "LHX", "KMB", "GRMN", "F",
    "EW", "ODFL", "EXC", "IT", "GEHC", "KVUE", "VRSK", "CCI", "CTSH", "XEL", "OTIS",
    "IR", "PCG", "EA", "IQV", "RMD", "VMC", "UAL", "LEN", "SYY", "ETR", "KHC", "ACGL",
    "WAB", "YUM", "RJF", "HUM", "MLM", "EFX", "DXCM", "CCL", "EXR", "GIS", "STZ",
    "LVS", "MTB", "DD", "TPL", "IRM", "DECK", "TTWO", "WTW", "HIG", "ED", "CNC",
    "LYV", "VICI", "EQT", "WEC", "MCHP", "HPE", "MPWR", "AVB", "HSY", "EBAY", "CAH",
    "HPQ", "ANSS", "CSGP", "TSCO", "BRO", "FITB", "XYL", "KEYS", "NUE", "DOW", "GDDY",
    "STT", "PPG", "SW", "EL", "K", "FTV", "MTD", "GPN", "EQR", "BR", "DOV", "SYF",
    "CPAY", "CHD", "HAL", "AEE", "DTE", "CDW", "VTR", "VLTO", "NVR", "TROW", "LYB",
    "NTAP", "TYL", "WST", "HBAN", "PPL", "AWK", "WAT", "ADM", "HUBB", "DVN", "EIX",
    "WBD", "PHM", "ON", "LII", "ROL", "WDC", "EXPE", "FE", "PTC", "ATO", "NRG", "WRB",
    "RF", "TDY", "WY", "ZBH", "SBAC", "CINF", "FOXA", "IFF", "DRI", "PKG", "ZBRA",
    "TER", "CNP", "CTRA", "LDOS", "STE", "STX", "NTRS", "FOX", "ES", "CF", "CBOE",
    "BIIB", "LH", "CMS", "IP", "VRSN", "TSN", "LUV", "ERIE", "MKC", "CLX", "FSLR",
    "ULTA", "KEY", "PODD", "INVH", "BLDR", "CO", "SMCI",    "ESS", "STLD", "PFG", 
    "L", "TRMB", "SNA", "JBL", "BBY", "MAA", "NI", "HAS", "IVZ", "CZR" ,
    "ARE", "FDS", "JBHT", "J", "PNR", "DGX", "ALGN", "MOH", "OMC", "MAS",
    "TPR", "HRL", "GEN", "GPC", "IEX", "BALL", "NWS", "CF", "BAX", "BF.B",
    "HOLX", "DLTR", "DG", "NWSA", "EXPD", "FFIV", "EG", "LNT", "AVY", "UD",
    "RL", "DPZ", "KIM", "RVTY", "DOC", "TXT", "SWKS", "EVRG", "APTV", "AKAM",
    "INCY", "AMCR", "DVA", "MRNA", "POOL", "VTRS", "EPAM", "SWK", "REG", "BXP",
    "SOLV", "JNPR", "NDSN", "TECH", "CHRW", "UHS", "CAG", "KMX", "CPT", "HST",
    "NCLH", "ALLE", "PAYC", "CPB", "TAP", "ALB", "SJM", "BG", "DAY", "EMN",
    "AIZ", "AOS", "IPG", "BEN", "LKQ", "GL", "PNW", "MGM", "WBA", "GNRC",
    "WYNN", "HSIC", "FRT", "LW", "APA", "CRL", "MOS", "ENPH", "TFX", "MKTX",
    "AES", "MHK", "MTCH", "HII", "CE"
    # Add 430 more entries...
)

@app.route('/api/etf-data', methods=['GET'])
def get_etf_data():
    imported = 0
    try:
        sector_data = {}  # Dictionary to store data grouped by sector

        for symbol in cusip_mapping:
            print(symbol)
            stock = yf.Ticker(symbol)
            history = stock.history(period="5d", interval="1d")  # Get last 5 days of data
            print('stock', stock)

            # Ensure we have at least 2 days of data
            if len(history) >= 2:
                current_price = history.iloc[-1]['Close']
                yesterday_price = history.iloc[-2]['Close']
            elif len(history) == 1:
                current_price = history.iloc[-1]['Close']
                yesterday_price = "N/A"
            else:
                current_price = "N/A"
                yesterday_price = "N/A"

            # Retrieve stock information
            stock_info = {
                "name": stock.info.get("shortName", "N/A"),
                "symbol": symbol,
                "sector": stock.info.get("sector", "N/A"),
                "industry": stock.info.get("industry", "N/A"),
                "current_price": current_price,
                "yesterday_price": yesterday_price,
                "market_cap": stock.info.get("marketCap", "N/A"),
                "pe_ratio": stock.info.get("trailingPE", "N/A"),
                "dividend_yield": stock.info.get("dividendYield", "N/A"),
            }

            # Group stock by sector
            sector = stock.info.get("sector", "N/A")
            if sector not in sector_data:
                sector_data[sector] = []
            sector_data[sector].append(stock_info)

            imported += 1

        # Return the data grouped by sector
        return jsonify({"sector_data": sector_data})
    
    except Exception as e:
        print(f'Error: {e}')
        print(f'Imported: {imported}')
        return jsonify({"error": "An error occurred while fetching the data."})

if __name__ == "__main__":
    app.run(debug=True)
