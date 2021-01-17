// ==UserScript==
// @name         Alipay Beancount Exporter
// @namespace    https://github.com/w1ndy/beancount-helpers
// @version      1.0
// @description  Extract and export Alipay transactions to Beancount
// @author       w1ndy
// @match        https://consumeprod.alipay.com/record/advanced.htm
// @match        https://my.alipay.com/portal/i.htm
// @grant        GM_setClipboard
// ==/UserScript==

function mountRecord() {
    const btn = document.createElement('a');
    btn.className = "ui-button ui-button-swhite";
    btn.onclick = function () {
        const transactions = [];

        const rows = document.querySelectorAll('.J-item');
        for (const r of rows) {
            const date = r.querySelector('.time-d').innerText.replaceAll('.', '-');
            const payee = r.querySelector('.other .name').innerText;
            const name = r.querySelector('.name .consume-title').innerText;
            const amount = parseFloat(r.querySelector('.amount .amount-pay').innerText.replace(' ', ''));

            let transaction = `${date} * "${payee}" "${name}"\n`;
            transaction += `    ${amount >= 0 ? 'Assets' : 'Liabilities'}: ${amount >= 0 ? '+' : ''}${amount.toFixed(2)} CNY\n`;
            transaction += `    ${amount >= 0 ? 'Income' : 'Expenses'}:`;
            transactions.unshift(transaction)
        }
        GM_setClipboard(transactions.join('\n\n'));
        btn.innerHTML = '<span class="ui-button-text">复制成功！</span>';
    }
    btn.innerHTML = '<span class="ui-button-text">导出本页为Beancount格式</span>';
    document.querySelector('.page-link').appendChild(btn);
}

function tryMountRecord() {
    if (!document.querySelector('.J-item')) {
        setTimeout(tryMountRecord, 500);
    } else {
        mountRecord();
    }
}

function mountPortal() {
    let extractingYuebao = false;
    let extractingHuabei = false;

    const extractYuebaoBtn = document.createElement('p');
    extractYuebaoBtn.className = 'fn-left fn-ml-5';
    extractYuebaoBtn.innerHTML = '<a href="javascript:void(0)">导出余额为Beancount格式</a>';
    extractYuebaoBtn.onclick = function extractYuebao() {
        const showYuebaoAmount = document.querySelector('#showYuebaoAmount');
        if (showYuebaoAmount.classList.contains('hide-amount')) {
            if (!extractingYuebao) {
                showYuebaoAmount.click();
                extractingYuebao = true;
            }
            setTimeout(extractYuebao, 500);
        } else {
            const balance = parseFloat(document.querySelector('.i-assets-mFund-amount').innerText);
            const date = new Date();
            GM_setClipboard(`${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${date.getDate()} balance Assets: ${balance.toFixed(2)} CNY\n`);
            extractYuebaoBtn.innerHTML = '复制成功！';
        }
    }
    document.querySelector('.i-assets-mfund .i-assets-header').appendChild(extractYuebaoBtn);

    const extractHuabeiBtn = document.createElement('p');
    extractHuabeiBtn.className = 'fn-left fn-ml-5';
    extractHuabeiBtn.innerHTML = '<a href="javascript:void(0)">导出余额为Beancount格式</a>';
    extractHuabeiBtn.onclick = function extractHuabei() {
        const showHuabeiAmount = document.querySelector('#showHuabeiAmount');
        if (showHuabeiAmount.classList.contains('hide-amount')) {
            if (!extractingHuabei) {
                showHuabeiAmount.click();
                extractingHuabei = true;
            }
            setTimeout(extractHuabei, 500);
        } else {
            const available = parseFloat(document.querySelector('#available-amount-container').innerText);
            const total = parseFloat(document.querySelector('#credit-amount-container').innerText);
            const date = new Date();
            GM_setClipboard(`${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${date.getDate()} balance Liabilities: ${(available - total).toFixed(2)} CNY\n`);
            extractHuabeiBtn.innerHTML = '复制成功！';
        }
    }
    document.querySelector('.i-assets-pcredit .i-assets-header').appendChild(extractHuabeiBtn);

}

function tryMountPortal() {
    if (!document.querySelector('#showYuebaoAmount')) {
        setTimeout(tryMountPortal, 500);
    } else {
        mountPortal();
    }
}

(function() {
    'use strict';
    if (location.href.match(/portal/)) {
        tryMountPortal();
    } else {
        tryMountRecord();
    }
})();
