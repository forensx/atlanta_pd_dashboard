from flask import Flask
app = Flask(__name__)

'''
GOAL
Update and download data every 24 hours
React frontend will ping api for live data

Use Selenium to scrape data of current year
'''

from selenium.webdriver.chrome.options import Options
from selenium import webdriver
def set_chrome_options() -> None:
    """Sets chrome options for Selenium.
    Chrome options for headless browser is enabled.
    """
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_prefs = {}
    chrome_options.experimental_options["prefs"] = chrome_prefs
    chrome_prefs["profile.default_content_settings"] = {"images": 2}
    return chrome_optionss

def scrape_data():
    driver = webdriver.Chrome(options=chrome_options)
    # Do stuff with your driver
    driver.get("http://www.python.org")
    assert "Python" in driver.title
    elem = driver.find_element_by_name("q")
    elem.clear()
    elem.send_keys("pycon")
    elem.send_keys(Keys.RETURN)
    assert "No results found." not in driver.page_source
    driver.close()
    return "Scraped it biotch"

@app.route('/')
def hello_world():
    return scrape_data()


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80, debug=True, threaded=True)