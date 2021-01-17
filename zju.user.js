// ==UserScript==
// @name         Zhejiang University Beancount Exporter
// @namespace    https://github.com/w1ndy/beancount-helpers
// @version      1.0
// @description  Extract and export Zhejiang University transactions to Beancount
// @author       w1ndy
// @match        http://ecardhall.zju.edu.cn:808/Page/Page
// @grant        GM_setClipboard
// ==/UserScript==

function mount() {
    const btn = document.createElement('a');
    btn.className = "button";
    btn.onclick = function () {
        let balanceChecked = false;
        const rows = document.querySelector('.datagrid-view2 .datagrid-body').querySelectorAll('tr');

        const transactions = [];
        for (const row of rows) {
            const date = row.querySelector('td[field="OCCTIME"]').innerText.split(' ')[0];
            const name = row.querySelector('td[field="MERCNAME"]').innerText;
            const amount = parseFloat(row.querySelector('td[field="TRANAMT"]').innerText);
            if (!balanceChecked) {
                const bal = parseFloat(row.querySelector('td[field="CARDBAL"]').innerText);
                transactions.unshift(`${date} balance Assets: ${bal} CNY`);
                balanceChecked = true;
            }

            let transaction = `${date} * "${name}"\n`;
            transaction += `    Assets: ${amount >= 0 ? '+' : ''}${amount.toFixed(2)} CNY\n`;
            transaction += `    ${amount >= 0 ? 'Income' : 'Expenses'}:`;
            transactions.unshift(transaction)
        }

        GM_setClipboard(transactions.join('\n\n'));
        btn.innerHTML = '<i></i><span>复制成功！</span><s></s>';
    }
    btn.innerHTML = '<i></i><span>导出本页为Beancount格式</span><s></s>';
    document.querySelector('.box dd:last-of-type').appendChild(btn);
}

function tryMount() {
    if (!document.querySelector('.searchdiv')) {
        setTimeout(tryMount, 500);
    } else {
        mount();
    }
}

(function() {
    'use strict';
    tryMount();
})();
