=== Quotelinks Investing Calculators ===
Contributors: quotelinks
Tags: calculator, compound interest, dividend, inflation, investment
Requires at least: 6.3
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

22 free investing calculators in one block: compound interest, dividend income, inflation, stock returns, portfolio backtest, bond yield and more.

== Description ==

Add a working investing calculator to any post or page in a few clicks. Pick a calculator in the block inserter, set the starting values if you like, and publish. Each calculator has charts, works on phones, and supports light and dark themes and 11 currencies.

No account, no API key and no settings page: the block works as soon as it is installed.

= The calculators =

* **What If I Had Invested** – What an investment in any US stock or ETF in any past month would be worth today, vs the S&P 500.
* **Compound Interest** – How a starting amount and monthly savings grow over time, after fees, tax drag and inflation.
* **Historical Inflation** – What an amount from any year or month since 1913 is worth in another, from official US CPI data.
* **Stock Return With Dividends** – Total return, price return and the part added by dividends for any stock or ETF between two months.
* **Real Return (Inflation-Adjusted)** – The return of any US stock or ETF after inflation between two months, in total and per year.
* **Portfolio Backtest** – How a mix of up to 10 stocks and ETFs would have done: return, volatility and worst drawdown.
* **Investment Return (CAGR & IRR)** – Your annual return from start and end values, or from dated deposits and withdrawals (XIRR).
* **Stock Profit** – Profit or loss, return, break-even price and tax on a stock trade, including commissions.
* **Dividend Income** – Yearly and monthly dividend income from your stocks and ETFs, with a month-by-month calendar.
* **Dividend & DRIP** – Future dividend income, yield on cost and how much reinvesting dividends adds.
* **Dividend Discount Model** – Fair value of a dividend stock with the Gordon growth or two-stage model, and the growth priced in.
* **Graham Number** – Benjamin Graham’s fair value from earnings and book value, with the margin of safety and his tests.
* **Average Down** – Your new average cost after buying more shares, or the shares needed to reach a target average.
* **Bond Yield to Maturity** – Yield to maturity, current yield, yield to call and duration from a bond’s price, coupon and maturity.
* **DCA vs Lump Sum** – Investing all at once versus spreading it out, in steady, crash and volatile markets.
* **Rule of 72** – How long money takes to double, triple or quadruple, with the exact figure alongside.
* **Asset Allocation & Rebalancing** – How far your portfolio has drifted from its target mix and the trades that bring it back.
* **Inflation** – What things will cost in the future and how much of its value your money loses.
* **Salary Inflation** – Whether your pay kept up with prices: an old salary in today’s money and your real raise.
* **Cash vs Inflation** – How cash in a money market fund or earning nothing did against inflation, month by month since 1954.
* **Fed Funds Rate History** – The federal funds rate since 1954, today’s target range and every Fed hike and cut since 1982.
* **Millionaire** – The month your savings reach $1 million, and what $1 million will be worth by then.

Stock and ETF calculators use end-of-day US market data. Inflation and interest-rate calculators use official data from the US Bureau of Labor Statistics and the Federal Reserve (via FRED).

= Features =

* One block with 22 variations: type "compound interest", "dividend" or "inflation" in the inserter to find a calculator directly.
* Starting values: pre-fill a ticker, amount, rate or date range for your article. Visitors can change every value.
* Article-width and sidebar layouts, light, dark or automatic theme, 11 currencies.
* Auto-height: the frame resizes to fit the calculator, so there is no inner scrollbar.
* Lightweight: each calculator loads lazily in its own frame, so it doesn't slow down the rest of your page. The plugin itself adds only a small stylesheet and a 1 KB resize script.
* No cookies, no tracking, no ads.

= Credit link =

When you add your first calculator, the block asks whether to show a small "Calculator by Quotelinks" link under it. The link is only added if you choose Yes, and you can turn it on or off at any time in the block settings. Showing it helps keep these calculators free.

== External services ==

The calculators run on quotelinks.com and are shown on your page in a frame (iframe). This plugin needs that service: without it, the block cannot show a calculator.

* What is sent and when: when a visitor views a page with a calculator (and when you edit such a page), the visitor's browser loads the calculator from https://www.quotelinks.com/calculators/embed/. The request contains the calculator's settings you chose in the block (calculator name, theme, currency and starting values) and, as with any web request, the visitor's IP address, browser user agent and the address of your page (referrer). Stock and ETF calculators also request price data for the tickers the visitor enters from https://www.quotelinks.com/calculators/api/.
* No cookies are set and no personal data is stored by the calculators beyond standard web server access logs.
* Service provider: Quotelinks, https://www.quotelinks.com/
* Terms of use and disclaimer: https://www.quotelinks.com/disclaimer.html
* Privacy policy: https://www.quotelinks.com/privacy.html

== Installation ==

1. In your dashboard go to Plugins > Add New, search for "Quotelinks Investing Calculators" and click Install, then Activate. You can also install it straight from the block inserter: search for "investing calculator".
2. Edit a post or page, click + and search for the calculator you want (for example "compound interest").
3. Choose the calculator, layout, theme and starting values in the block settings on the right.

== Frequently Asked Questions ==

= Is it free? =

Yes. All calculators are free for personal and commercial websites. There is no paid version.

= Does the plugin add links to my site? =

Only if you want it to. The first time you add a calculator, the block asks whether to show a small "Calculator by Quotelinks" credit link. Nothing is added unless you choose Yes, and you can change it per calculator in the block settings.

= Does it work with the classic editor or page builders? =

The plugin adds a block for the block editor (Gutenberg), including the site editor and block widgets. For other editors you can copy the embed code from any calculator page on quotelinks.com and paste it into an HTML or code element.

= Where does the data come from? =

End-of-day US stock and ETF prices and dividends come from Quotelinks' licensed market data. Inflation data is the US Consumer Price Index (CPI-U) from the Bureau of Labor Statistics, and interest rates are from the Federal Reserve, both via FRED.

= Can I change the starting values? =

Yes. Open "Starting values" in the block settings. Leave a field empty to use the calculator's default. Your visitors can still change every value.

= Is the result financial advice? =

No. Results are estimates for illustration only, based on the numbers entered and historical data.

== Screenshots ==

1. Compound Interest Calculator on a page.
2. Find a calculator by name in the block inserter.
3. Block settings: choose the calculator and pre-fill starting values, here with real stock data.
4. The credit link question shown when the first calculator is added.

== Changelog ==

= 1.0.0 =
* First release: 22 calculators in one block.

== Upgrade Notice ==

= 1.0.0 =
First release.
