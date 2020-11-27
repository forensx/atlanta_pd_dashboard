from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select

import pandas as pd
import json
import numpy as np
import datetime

options = Options()
options.headless = True
options.add_argument("--window-size=1920,1200")
options.add_experimental_option("prefs", {
    "download.default_directory": "./data",
    "download.prompt_for_download": False,
    "download.directory_upgrade": True,
    "safebrowsing.enabled": True
})

driver = webdriver.Chrome(options=options)
driver.get("http://opendata.atlantapd.org/Crimedata/Default.aspx")
city_wide_crime_select = driver.find_element_by_xpath(
    '//*[@id="MainContent_rblArea_0"]').click()

select = Select(driver.find_element_by_xpath(
    '//*[@id="MainContent_ddlMonth"]'))
select.select_by_visible_text('November')
select2 = Select(driver.find_element_by_xpath(
    '//*[@id="MainContent_ddlYear"]'))
select2.select_by_visible_text("2020")

search_click = driver.find_element_by_xpath(
    '//*[@id="MainContent_btnSearch"]').click()
download_click = driver.find_element_by_xpath(
    '//*[@id="MainContent_btnDownload"]').click()
driver.quit()

df = pd.read_csv("./data/Data.csv")
df = df[['Lat', 'Long', 'UC2_Literal', 'Report Date']]
data = []
for row in df.itertuples(index=False):
    data.append({
        'COORDINATES': [row[0], row[1]],
        'TYPE': row[2],
        #         'DATE': datetime.datetime.strptime(row[3], '%m/%d/%Y').strftime("%Y-%m-%d %H:%M:%S"),
        'DATE': datetime.datetime.strptime(row[3], '%m/%d/%Y').timestamp() * 1000
    })
print(data)

with open('2020_November.json', 'w') as f:
    json.dump(data, f)

print("DONE")
