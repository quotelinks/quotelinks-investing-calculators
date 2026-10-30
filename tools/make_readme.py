#!/usr/bin/env python3
"""Generate README.md from the plugin's calculators.json (keeps the calculator table and
embed parameters in sync with the site). Usage: python tools/make_readme.py"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SITE = 'https://www.quotelinks.com'
calcs = json.load(open(os.path.join(ROOT, 'wordpress-plugin', 'quotelinks-investing-calculators', 'block', 'calculators.json'), encoding='utf-8'))['calculators']

TYPE_HINT = {'sym': 'ticker', 'pf': 'TICKER:weight list', 'ym': 'YYYY or YYYY-MM', 'enum': None, 'num': 'number'}


def params(c):
    out = []
    for p in c['params']:
        if p['t'] == 'enum':
            out.append('`%s` (%s)' % (p['k'], ' \\| '.join(o[0] for o in p['o'])))
        else:
            out.append('`%s`' % p['k'])
    return ', '.join(out)


rows = '\n'.join('| [%s](%s/calculators/%s.html) | %s | %s | %d / %d |' % (
    c['title'], SITE, c['slug'], c['desc'], params(c), c['h'][0], c['h'][1]) for c in calcs)

readme = f"""# Free Investing Calculators for Websites

[![Quotelinks investing calculators](docs/banner.png)]({SITE}/calculators/)

**22 free investing calculators you can add to any website, blog or WordPress site**: compound interest, dividend income, DRIP, historical inflation, stock return, portfolio backtest, bond yield, Graham number and more. They have interactive charts, work on phones and come in light and dark themes, with 11 currencies. No sign-up, no API key, no cost.

- **Live calculators and embed-code generator:** [{SITE.replace('https://', '')}/calculators/]({SITE}/calculators/)
- **WordPress plugin:** [Quotelinks Investing Calculators](https://wordpress.org/plugins/quotelinks-investing-calculators/) (in review at WordPress.org; source in [`wordpress-plugin/`](wordpress-plugin/))
- **Live examples:** [quotelinks.github.io/quotelinks-investing-calculators/examples/](https://quotelinks.github.io/quotelinks-investing-calculators/examples/)

| Compound interest | What if I had invested | Dividend income (dark theme) |
|---|---|---|
| [![Compound interest calculator](docs/compound-interest.png)]({SITE}/calculators/compound-interest.html) | [![What if I had invested calculator](docs/what-if-invested.png)]({SITE}/calculators/what-if-invested.html) | [![Dividend income calculator](docs/dividend-income-dark.png)]({SITE}/calculators/dividend-income.html) |

## Quick start

Paste this into your page's HTML (WordPress "Custom HTML" block, Blogger "HTML/JavaScript" gadget, Wix "Embed code", Squarespace "Code" block, Webflow "Embed", Ghost "HTML" card or any static site):

```html
<!-- Compound interest calculator by Quotelinks - free to embed. Please keep the credit line under the calculator visible and unchanged. -->
<iframe src="{SITE}/calculators/embed/compound-interest.html" title="Compound interest calculator" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"
  style="display:block;width:100%;max-width:760px;height:700px;border:0"></iframe>
<p style="max-width:760px;margin:6px 0 0;font-size:13px"><a href="{SITE}/calculators/compound-interest.html">Compound interest calculator</a> by <a href="{SITE}/">Quotelinks</a></p>
<script src="{SITE}/calculators/resize.js" async></script>
```

To embed a different calculator, replace `compound-interest` with its name from the table below, and use the height from the table. The easiest way is the generator at the bottom of each calculator page: pick the layout, theme and currency, type your starting values into the calculator and copy the code.

## The calculators

| Calculator | What it does | Starting-value parameters | Height (px) article / sidebar |
|---|---|---|---|
{rows}

## Options

Add options to the frame address as URL parameters, for example
`{SITE}/calculators/embed/what-if-invested.html?symbol=MSFT&amount=5000&from=2015-01&theme=dark`

| Parameter | Values | Default |
|---|---|---|
| `theme` | `light`, `dark`, `auto` (follows the visitor's device) | `light` |
| `currency` | `USD`, `EUR`, `GBP`, `CAD`, `AUD`, `NZD`, `CHF`, `INR`, `JPY`, `SGD`, `ZAR` (symbol and number format only; stock prices stay in US dollars) | `USD` |
| `locale` | any BCP 47 tag, e.g. `en-GB`, `de-DE` (number and month format) | from the currency |
| Starting values | the parameters listed for each calculator above; visitors can change every value | the calculator's defaults |

**Layout.** Use `max-width:760px` with the article height for content columns, or `max-width:400px` with the sidebar height for sidebars and narrow columns.

**Auto-height.** The optional `resize.js` line resizes each calculator frame to fit its content, so there is no inner scrollbar. It only listens for size messages from quotelinks.com frames. Without it, the frame keeps the fixed height from the embed code. Some platforms strip scripts; the calculator still works without it.

## WordPress

Install the **Quotelinks Investing Calculators** plugin to add the calculators as a block: click **+** in the editor and search for the calculator by name, e.g. "compound interest" or "dividend".

| Find a calculator in the inserter | Block settings and starting values |
|---|---|
| ![Block inserter search](docs/wordpress-inserter.jpg) | ![Block settings](docs/wordpress-block-settings.jpg) |

- From WordPress.org: **Plugins → Add New** and search for "Quotelinks Investing Calculators" (available once the review is complete).
- From this repository: download the latest release zip from [Releases](https://github.com/quotelinks/quotelinks-investing-calculators/releases), then **Plugins → Add New → Upload Plugin**.
- Without a plugin: paste the embed code above into a **Custom HTML** block.

## How it works

- Each calculator runs in its own frame from quotelinks.com, so it doesn't conflict with your theme's CSS or scripts and loads lazily.
- Charts are inline SVG; no third-party libraries, cookies, local storage, ads or analytics trackers.
- Stock and ETF calculators use end-of-day US market data (prices, total returns and dividends). Inflation calculators use the US Consumer Price Index (CPI-U) from the Bureau of Labor Statistics, and the Fed funds calculator uses Federal Reserve data, both via FRED.
- The numbers your visitors type are calculated in their browser. Ticker symbols are sent to quotelinks.com to look up prices. See the [privacy policy]({SITE}/privacy.html).

## Terms

Free for personal and commercial websites. Please keep the "by Quotelinks" credit line under the calculator visible and unchanged, and don't modify the calculators or present them as your own. Results are estimates for illustration only, not financial advice. See the [disclaimer and terms]({SITE}/disclaimer.html).

## License

The code in this repository (the WordPress plugin and the examples) is licensed under the [GNU General Public License v2.0 or later](LICENSE). The calculators themselves are a free hosted service of [Quotelinks]({SITE}/); the market data they show is licensed to Quotelinks and is not covered by this license.

## More from Quotelinks

- [Free stock widgets](https://github.com/quotelinks/quotelinks-stock-widgets): stock card, ticker tape and market movers ([live]({SITE}/widgets/))
- [Stock screener]({SITE}/screener.html) and [ETF screener]({SITE}/etf-screener.html)
- [Investing dictionary]({SITE}/dictionary.html)
"""
with open(os.path.join(ROOT, 'README.md'), 'w', encoding='utf-8', newline='\n') as f:
    f.write(readme)
print('README.md: %d calculators, %d bytes' % (len(calcs), len(readme)))
