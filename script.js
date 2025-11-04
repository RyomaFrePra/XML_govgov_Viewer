const dropArea = document.getElementById('drop-area');
const resultDiv = document.getElementById('result');

dropArea.addEventListener('dragover', function (e) {
    e.preventDefault();
    dropArea.style.backgroundColor = '#f0f0f0';
});

dropArea.addEventListener('dragleave', function () {
    dropArea.style.backgroundColor = '#fff';
});

dropArea.addEventListener('drop', function (e) {
    e.preventDefault();
    dropArea.style.backgroundColor = '#fff';

    const files = e.dataTransfer.files;
    if (files.length !== 2) {
        resultDiv.textContent = 'XMLファイルとXSLファイルをセットでドラッグアンドドロップしてください。';
        return;
    }

    let xmlFile, xslFile;
    for (let file of files) {
        if (file.name.endsWith('.xml')) xmlFile = file;
        else if (file.name.endsWith('.xsl')) xslFile = file;
    }

    if (!xmlFile || !xslFile) {
        resultDiv.textContent = 'XMLファイルとXSLファイルが正しくセットで指定されていません。';
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        let xmlText = event.target.result;

        // ✅ xml-stylesheet宣言を削除（ファイル自体は変更しない）
        xmlText = xmlText.replace(/<\?xml-stylesheet[^>]*\?>/i, '');

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
        readXSL(xslFile, xmlDoc);
    };
    reader.readAsText(xmlFile);
});

function readXSL(xslFile, xmlDoc) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const xslText = event.target.result;
        const parser = new DOMParser();
        const xslDoc = parser.parseFromString(xslText, 'application/xml');
        applyXSLT(xmlDoc, xslDoc);
    };
    reader.readAsText(xslFile);
}

function applyXSLT(xmlDoc, xslDoc) {
    const xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xslDoc);

    let resultFragment = null;

    try {
        resultFragment = xsltProcessor.transformToFragment(xmlDoc, document);
    } catch (err) {
        console.error('transformToFragment エラー:', err);
    }

    resultDiv.innerHTML = '';

    if (resultFragment && resultFragment.nodeType) {
        // 正常にNodeが返った場合
        resultDiv.appendChild(resultFragment);
        convertHTML(resultDiv);
    } else {
        // transformToFragmentがnullのとき、文字列変換で再試行
        try {
            const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
            const htmlString = new XMLSerializer().serializeToString(resultDoc);
            resultDiv.innerHTML = htmlString;
            convertHTML(resultDiv);
        } catch (err2) {
            console.error('transformToDocument エラー:', err2);
            resultDiv.textContent = 'XSLT変換に失敗しました。';
        }
    }
}

// HTMLエンティティを適切に変換する関数
function convertHTML(element) {
    element.innerHTML = element.innerHTML
        .replace(/&lt;br\/&gt;/g, '<br>')
        .replace(/&lt;a\s+href="([^"]+)"&gt;/g, '<a href="$1">')
        .replace(/&lt;\/a&gt;/g, '</a>')
        .replace(/<pre\s+class="normal">/g, '<div class="normal">')
        .replace(/<\/pre>/g, '</div>')
        .replace(/<pre>/g, '<div>')
        .replace(/<\/pre>/g, '</div>');

    element.style.margin = '0';
    element.style.padding = '0';
    element.style.border = 'none';
    element.style.boxSizing = 'border-box';
}
