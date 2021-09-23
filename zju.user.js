// ==UserScript==
// @name         Zhejiang University Beancount Exporter
// @namespace    https://github.com/w1ndy/beancount-helpers
// @version      1.1.1
// @description  Extract and export Zhejiang University transactions to Beancount
// @author       w1ndy
// @match        http://mapp.zju.edu.cn/_web/_customizes/pc_logistics/card/oneCardSolution.html*
// @grant        GM_setClipboard
// ==/UserScript==

function mount() {
    const btn = document.createElement('button');
    btn.className = "layui-btn";
    btn.type = "button";
    btn.onclick = function () {
        const rows = document.querySelector('#table-body-custom').querySelectorAll('tr');

        const transactions = [];
        for (const row of rows) {
            const cells = row.querySelectorAll('td');
            const date = cells[0].innerHTML;
            const name = cells[1].innerText;
            const amount = cells[3].innerText;

            let transaction = `${date} * "${name || '充值'}"\n`;
            transaction += `    Assets: ${name ? '-' : '+'}${amount} CNY\n`;
            transaction += `    ${name ? 'Expenses' : 'Assets'}:`;
            transactions.unshift(transaction)
        }

        transactions.push(`${new Date().toISOString().split('T')[0]} balance Assets: ${document.querySelector('#card-balance-num').innerHTML} CNY\n`);

        GM_setClipboard(transactions.join('\n\n'));
        btn.innerHTML = '复制成功！';
    }
    btn.innerHTML = '导出本页为Beancount格式';
    document.querySelector('.form-group .layui-inline').appendChild(btn);
}

function tryMount() {
    if (!document.querySelector('.form-group .layui-inline')) {
        setTimeout(tryMount, 500);
    } else {
        mount();
    }
}

(function() {
    'use strict';
    tryMount();
})();
