function loadXMLDoc(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(e.target.result, "application/xml");
            if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                reject("XML Parsing Error: " + xmlDoc.getElementsByTagName("parsererror")[0].textContent);
            } else {
                resolve(xmlDoc);
            }
        };
        reader.onerror = function (e) {
            reject(e);
        };
        reader.readAsText(file);
    });
}

async function handleDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    let xmlFile = null;
    let xslFile = null;

    for (let file of files) {
        if (file.name.endsWith(".xml")) {
            xmlFile = file;
        } else if (file.name.endsWith(".xsl")) {
            xslFile = file;
        }
    }

    if (xmlFile && xslFile) {
        try {
            const xml = await loadXMLDoc(xmlFile);
            const xsl = await loadXMLDoc(xslFile);

            // SaxonJS をロード
            if (typeof SaxonJS === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://www.saxonica.com/SaxonJS/SaxonJS2.js'; // SaxonJS のパス
                script.onload = () => {
                    transformWithSaxonJS(xml, xsl);
                };
                document.head.appendChild(script);
            } else {
                transformWithSaxonJS(xml, xsl);
            }

        } catch (error) {
            console.error("Error loading XML or XSL:", error);
            alert("XML/XSLの読み込みまたは処理に失敗しました。");
        }
    } else {
        alert("XMLファイルとXSLファイルの両方をアップロードしてください。");
    }
}

function transformWithSaxonJS(xml, xsl) {
    try {
        // SaxonJS の XSLTProcessor を作成
        const xsltProcessor = SaxonJS.XSLT.createProcessor();

        // XSLT スタイルシートをロード
        xsltProcessor.setStylesheet(xsl);

        // XML ドキュメントを変換
        const result = xsltProcessor.transform(xml);

        // 結果を HTML に挿入
        const content = document.getElementById("content");
        content.innerHTML = result.toString();

    } catch (xsltError) {
        console.error("XSLT Processing Error:", xsltError);
    }
}

// ... (loadXMLDoc関数、handleDragOver関数、addEventListenerの処理は変更なし)

function handleDragOver(event) {
    event.preventDefault();
}

document.getElementById("drop_zone").addEventListener("dragover", handleDragOver, false);
document.getElementById("drop_zone").addEventListener("drop", handleDrop, false);
