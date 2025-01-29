from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf

app = Flask(__name__)
CORS(app)  


cusip_mapping = (
    "NVDA", "AAPL", "MSFT", "GOOG", "AMZN", "GOOGL", "META", "TSLA", "AVGO", "BRK-B",
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
        print(request)
        sector_data = {}
        selected_date = request.args.get('date')

        for symbol in cusip_mapping:
            stock = yf.Ticker(symbol)
            history = stock.history(period="5d", interval="1d")  # Fetch data for the last 5 days

            # Convert the index (dates) to strings for easier comparison
            if not history.empty:
                history.index = history.index.strftime('%Y-%m-%d')

            # Extract closing prices as a dictionary
            closing_prices = history['Close'].to_dict() if not history.empty else {}

            # Get the price for the selected date
            date_price = closing_prices.get(selected_date, "N/A") if selected_date else "N/A"

            # Get today's price (last available price)
            today_price = list(closing_prices.values())[-1] if closing_prices else "N/A"

            # Get yesterday's price (second last available price)
            yesterday_price = (
                list(closing_prices.values())[-2] if len(closing_prices) >= 2 else "N/A"
            )

            # Add stock info including closing prices, today's price, and yesterday's price
            stock_info = {
                "name": stock.info.get("shortName", "N/A"),
                "symbol": symbol,
                "sector": stock.info.get("sector", "N/A"),
                "industry": stock.info.get("industry", "N/A"),
                "selected_date": selected_date,
                "date_price": date_price,  # Price on the selected date
                "today_price": today_price,  # Today's price
                "yesterday_price": yesterday_price,  # Yesterday's price
                "closing_prices": closing_prices,  # Include last 5 days' closing prices
                "market_cap": stock.info.get("marketCap", "N/A"),
                "pe_ratio": stock.info.get("trailingPE", "N/A"),
                "dividend_yield": stock.info.get("dividendYield", "N/A"),
            }

            # Group data by sector
            sector = stock.info.get("sector", "N/A")
            if sector not in sector_data:
                sector_data[sector] = []
            sector_data[sector].append(stock_info)

            imported += 1

        return jsonify({"sector_data": sector_data, "status": "success"})

    except Exception as e:
        print(f'Error: {e}')
        print(f'Imported: {imported}')
        return jsonify({"error": "An error occurred while fetching the data."})

    
@app.route('/api/etf', methods=['GET'])
def get_etf():
    try:
        stock_data = []  # Store data for all stocks

        for symbol in cusip_mapping:
            print(f"Fetching data for {symbol}")
            stock = yf.Ticker(symbol)
            history = stock.history(period="5d", interval="1d")  # Last 5 days of data

            if not history.empty:  # Ensure data exists
                # Extract closing prices for the last 5 days
                closing_prices = history['Close'].tolist()
                yesterday_price = closing_prices[-2] if len(closing_prices) >= 2 else "N/A"

                # Append stock data
                stock_data.append({
                    "name": stock.info.get("shortName", "N/A"),
                    "symbol": symbol,
                    "sector": stock.info.get("sector", "N/A"),
                    "industry": stock.info.get("industry", "N/A"),
                    "closing_prices": closing_prices,  # 5 days of closing prices
                    "yesterday_price": yesterday_price
                })

        return jsonify({"data": stock_data, "status": "success"})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e), "status": "failure"}), 500

    

if __name__ == "__main__":
    app.run(debug=True)
