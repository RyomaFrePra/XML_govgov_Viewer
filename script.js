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

            console.log("Loaded XSL:", xsl);

            if (window.ActiveXObject || "ActiveXObject" in window) {
                const ex = xml.transformNode(xsl);
                document.getElementById("content").innerHTML = ex;
            } else if (document.implementation && document.implementation.createDocument) {
                try {
                    const xsltProcessor = new XSLTProcessor();
                    xsltProcessor.importStylesheet(xsl);
                    const resultDocument = xsltProcessor.transformToFragment(xml, document);
                    
                    const content = document.getElementById("content");
                    content.textContent = ""; // 以前の内容をクリア
                    content.appendChild(resultDocument); // XSLT適用後のコンテンツを追加
                } catch (xsltError) {
                    console.error("XSLT Processing Error:", xsltError);
                }
            }
        } catch (error) {
            console.error("Error loading XML or XSL:", error);
            alert("XML/XSLの読み込みまたは処理に失敗しました。");
        }
    } else {
        alert("XMLファイルとXSLファイルの両方をアップロードしてください。");
    }
}

function handleDragOver(event) {
    event.preventDefault();
}

document.getElementById("drop_zone").addEventListener("dragover", handleDragOver, false);
document.getElementById("drop_zone").addEventListener("drop", handleDrop, false);
