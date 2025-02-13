const dropArea = document.getElementById('drop-area');
const resultDiv = document.getElementById('result');

dropArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    dropArea.style.backgroundColor = '#f0f0f0';
});

dropArea.addEventListener('dragleave', function(e) {
    dropArea.style.backgroundColor = '#fff';
});

dropArea.addEventListener('drop', function(e) {
    e.preventDefault();
    dropArea.style.backgroundColor = '#fff';

    const files = e.dataTransfer.files;
    if (files.length !== 2) {
        resultDiv.innerHTML = 'XMLファイルとXSLファイルをセットでドラッグアンドドロップしてください。';
        return;
    }

    let xmlFile, xslFile;
    // XMLファイルとXSLファイルを分ける
    for (let file of files) {
        if (file.name.endsWith('.xml')) {
            xmlFile = file;
        } else if (file.name.endsWith('.xsl')) {
            xslFile = file;
        }
    }

    if (!xmlFile || !xslFile) {
        resultDiv.innerHTML = 'XMLファイルとXSLファイルが正しくセットで指定されていません。';
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        const xmlText = event.target.result;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
        readXSL(xslFile, xmlDoc);
    };

    reader.readAsText(xmlFile);
});

function readXSL(xslFile, xmlDoc) {
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const xslText = event.target.result;
        const parser = new DOMParser();
        const xslDoc = parser.parseFromString(xslText, 'application/xml');
        applyXSLT(xmlDoc, xslDoc);
    };

    reader.readAsText(xslFile);
}

function applyXSLT(xmlDoc, xslDoc) {
    if (window.ActiveXObject || 'ActiveXObject' in window) {
        // IE または MSXMLのサポート
        const xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(xslDoc);
        const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
        resultDiv.innerHTML = new XMLSerializer().serializeToString(resultDoc);
    } else if (document.implementation && document.implementation.createDocument) {
        // 他のブラウザ（Chrome等）での処理
        const xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(xslDoc);
        const resultDoc = xsltProcessor.transformToFragment(xmlDoc, document);
        resultDiv.innerHTML = '';  // 既存の内容をクリア
        resultDiv.appendChild(resultDoc);

        // HTMLエンティティを適切に変換する
        convertHTML(resultDiv);
    }
}

// HTMLエンティティを適切に変換する関数
function convertHTML(element) {
    // innerHTMLがある場合は、その中のHTMLを変換
    element.innerHTML = element.innerHTML.replace(/&lt;br\/&gt;/g, '<br></br>') // <br/> -> <br></br>
                                       .replace(/&lt;a\s+href="([^"]+)"&gt;/g, '<a href="$1">') // &lt;a href="..."&gt; -> <a href="...">
                                       .replace(/&lt;\/a&gt;/g, '</a>') // &lt;/a&gt; -> </a>
                                       .replace(/<pre\s+class="normal">/g, '<div class="normal">') // <pre class="normal"> -> <div class="normal">
                                       .replace(/<\/pre>/g, '</div>') // </pre> -> </div>
                                       .replace(/<pre>/g, '<div>') // <pre> -> <div>
                                       .replace(/<\/pre>/g, '</div>'); // </pre> -> </div>

    // 余計な外枠の修正
    element.style.margin = '0';  // 外側の余白を削除
    element.style.padding = '0'; // 内側の余白を削除
    element.style.border = 'none'; // 境界線を削除
    element.style.boxSizing = 'border-box'; // サイズ調整
}
