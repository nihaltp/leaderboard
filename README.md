# 🏆 GSheet to Leaderboard

Turn your Google Sheets into beautiful, shareable leaderboards instantly. 

This purely client-side web application takes a CSV link (published from Google Sheets) and visualizes the data as an interactive leaderboard with rankings, progress bars, and detailed statistics.

## ✨ Features

* **Visual Leaderboard:** Beautiful card layout with medals for top 3 and progress bars.
* **Data Table View:** Toggle to a detailed table view to see exactly which days/tasks were completed.
* **Live Sync:** Just refresh the page to fetch the latest data from your Google Sheet.
* **Smart Ranking:** Handles ties intelligently (e.g., if two people are 1st, the next person is 2nd).
* **Export Options:** Download high-quality **PNG images** or **PDFs** of your leaderboard to share on social media.
* **Customizable Title:** Double-click the heading to rename your leaderboard.
* **Shareable URLs:** The link, title, and view preferences are saved in the URL, making it easy to bookmark or share specific views.

## 🚀 Live Demo

You can try the leaderboard with this sample dataset:

[**View Sample Leaderboard**](https://nihaltp.github.io/leaderboard/?link=https://docs.google.com/spreadsheets/d/e/2PACX-1vTdsItfRpmDZAOItypcrKh_osjo66z-RGbNguGzRXJePPt5Zme7cuEHQHnO-4cQv4Ru0AEkPJcNopAn/pub?output=csv)

## 📋 How to Use

### 1. Prepare your Google Sheet

Your sheet needs to follow a specific format:

* **Row 1:** Dates or Task Names (starting from Column B).
* **Column A:** Names of participants.
* **Cells:** Fill completed cells with a checkmark **✅**.

**[See Sample Sheet Format](https://docs.google.com/spreadsheets/d/1pDMREIVgLeus03oH8QncNzfv_ecmg90SSu7vYoTq9_E/edit?usp=sharing)**

### 2. Publish to Web

1. Open your Google Sheet.
2. Go to **File** > **Share** > **Publish to Web**.
3. Click **Publish** and copy the link generated.

### 3. Generate Leaderboard

1. Open this [website](https://nihaltp.github.io/leaderboard/).
2. Paste the link into the "Google Sheet Link" box.
3. Press **Enter** or click **Fetch Leaderboard**.

## 🛠 URL Parameters

You can customize the leaderboard via URL parameters for easy sharing:

| Parameter | Value | Description | Example |
| :--- | :--- | :--- | :--- |
| `link` | `url` | The Google Sheet CSV link. | [nihaltp.github.io/leaderboard/?link=somelink](https://nihaltp.github.io/leaderboard/?link=https://docs.google.com/spreadsheets/d/e/2PACX-1vTdsItfRpmDZAOItypcrKh_osjo66z-RGbNguGzRXJePPt5Zme7cuEHQHnO-4cQv4Ru0AEkPJcNopAn/pub?output=csv/) |
| `title` | `text` | Sets the main heading of the page. | [nihaltp.github.io/leaderboard/?title=My%20Leaderboard](https://nihaltp.github.io/leaderboard/?title=My%20Leaderboard&link=https://docs.google.com/spreadsheets/d/e/2PACX-1vTdsItfRpmDZAOItypcrKh_osjo66z-RGbNguGzRXJePPt5Zme7cuEHQHnO-4cQv4Ru0AEkPJcNopAn/pub?output=csv/) |
| `view` | [`leaderboard`](https://nihaltp.github.io/leaderboard/?view=leaderboard&link=https://docs.google.com/spreadsheets/d/e/2PACX-1vTdsItfRpmDZAOItypcrKh_osjo66z-RGbNguGzRXJePPt5Zme7cuEHQHnO-4cQv4Ru0AEkPJcNopAn/pub?output=csv) / [`table`](https://nihaltp.github.io/leaderboard/?view=table&link=https://docs.google.com/spreadsheets/d/e/2PACX-1vTdsItfRpmDZAOItypcrKh_osjo66z-RGbNguGzRXJePPt5Zme7cuEHQHnO-4cQv4Ru0AEkPJcNopAn/pub?output=csv) | Sets the default view mode. | [nihaltp.github.io/leaderboard/?view=table](https://nihaltp.github.io/leaderboard/?view=table&link=https://docs.google.com/spreadsheets/d/e/2PACX-1vTdsItfRpmDZAOItypcrKh_osjo66z-RGbNguGzRXJePPt5Zme7cuEHQHnO-4cQv4Ru0AEkPJcNopAn/pub?output=csv/) |
| `rank` | [`dense`](https://nihaltp.github.io/leaderboard/?rank=dense&link=https://docs.google.com/spreadsheets/d/e/2PACX-1vTdsItfRpmDZAOItypcrKh_osjo66z-RGbNguGzRXJePPt5Zme7cuEHQHnO-4cQv4Ru0AEkPJcNopAn/pub?output=csv) / [`competition`](https://nihaltp.github.io/leaderboard/?rank=competition&link=https://docs.google.com/spreadsheets/d/e/2PACX-1vTdsItfRpmDZAOItypcrKh_osjo66z-RGbNguGzRXJePPt5Zme7cuEHQHnO-4cQv4Ru0AEkPJcNopAn/pub?output=csv) | Changes ranking logic (Dense = 1,1,2; Competition = 1,1,3). | [nihaltp.github.io/leaderboard/?rank=competition](https://nihaltp.github.io/leaderboard/?rank=competition&link=https://docs.google.com/spreadsheets/d/e/2PACX-1vTdsItfRpmDZAOItypcrKh_osjo66z-RGbNguGzRXJePPt5Zme7cuEHQHnO-4cQv4Ru0AEkPJcNopAn/pub?output=csv/) |

## 💻 Tech Stack

* **React:** For UI components and state management (loaded via CDN).
* **Tailwind CSS:** For styling and responsive design.
* **PapaParse:** For robust CSV parsing.
* **html2canvas:** For generating downloadable leaderboard images.
* **jsPDF:** For PDF generation.

## 🏃‍♂️ Running Locally

Since this app uses no build step (it uses CDN links), you can run it directly:

1. Clone the repository:

    ```bash
    git clone https://github.com/nihaltp/leaderboard.git
    ```

2. Open `index.html` in your browser.
    * *Note: For the best experience, use a simple local server (like Live Server in VS Code) to avoid CORS issues with local files.*

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [nihaltp](https://github.com/nihaltp)
