#finance dashboard

Unzip the File
use internet for all installation

Install Python 3.14, then verify the installation:
    Press Windows + R, type `cmd`, and press Enter.
    In Command Prompt, run:
        python --version

Install Node.Js, then verify the installation:
    Press Windows + R, type `cmd`, and press Enter.
    In Command Prompt, run:
        Node -v
		npm -v

Open Visual Studio Code and install the required Python, Node extensions.

Go to File → New Window → Open Folder, then select the `finance-dashboard` folder.

Open the terminal and run:
	cd backend
    py -m venv .venv
    venv\Scripts\Activate
    pip install -r requirements.txt
	python manage.py runserver
	Then create a '+' icon to create new terminal then type:
	cd frontend
	npm install
	npm install axios
	npm run dev

In the ouput page, select Create account:
    Username: ajmal
    Email: ajmal@example.com
    Password: ajmal12345

Click Transactions:
    Add income:
        Type: Income
        Category: Salary
        Amount: 50000
        Description: September salary
        Date: 2026-09-01
    Add expense:
        Type: Expense
        Category: Food
        Amount: 450
        Description: Grocery shopping
        Date: 2026-09-02

Click Budget :
    Create a budget:
    Category: Food
    Month: 2026-09-01
    Monthly limit: 5000

Click savings goal:
    Goal name: New Laptop
    Target amount: 80000
    Current amount: 10000
    Target date: 2026-12-31

Create a CSV file from that text, then upload it:
    Open Notepad.
    Paste this:
        date,description,amount,type,category
        2026-09-01,Monthly Salary,50000,income,Salary
        2026-09-02,Grocery Shopping,450,expense,Food
        2026-09-03,Metro Card Recharge,300,expense,Transport
        2026-09-04,Freelance Project,8000,income,Freelance
    Choose File → Save As.
    Set the file name to: (transactions.csv)
    Set Save as type to All Files.
    Set encoding to UTF-8.

On the app’s Import CSV page:
    Click Choose File
    Select transactions.csv
    Click Import transactions
    You should see:
        4 transactions imported

Then Click the Dashboard and view the results