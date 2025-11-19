function loadXMLDoc(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (e) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(e.target.result, "application/xml");
          resolve(xmlDoc);
      };
      reader.onerror = function (e) {
          reject(e);
      };
      reader.readAsText(file);
  });
}

// 強制的に改行スタイルを適用する関数
function forceWrapStyles() {
    const contentDiv = document.getElementById("content");
    // content内のすべての要素を取得
    const allElements = contentDiv.querySelectorAll("*");

    allElements.forEach(el => {
        // 1. スタイルプロパティに 'important' 付きで強制設定
        el.style.setProperty("white-space", "normal", "important");
        el.style.setProperty("word-break", "break-all", "important");
        el.style.setProperty("overflow-wrap", "break-word", "important");
        
        // 2. 古いHTML属性（nowrap）があれば削除
        if (el.hasAttribute("nowrap")) {
            el.removeAttribute("nowrap");
        }
        
        // 3. テーブルセルの場合、幅固定で文字が溢れるのを防ぐ
        if (el.tagName === "TD" || el.tagName === "TH") {
             el.style.setProperty("word-wrap", "break-word", "important");
        }
    });
}

async function handleDrop(event) {
  event.preventDefault();
  const files = event.dataTransfer.files;
  const xmlFiles = [];
  const xslFiles = [];

  for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.endsWith(".xml")) {
          xmlFiles.push(file);
      } else if (file.name.endsWith(".xsl")) {
          xslFiles.push(file);
      }
  }

  if (xmlFiles.length > 0 && xslFiles.length > 0) {
      try {
          const xml = await loadXMLDoc(xmlFiles[0]);
          const xsl = await loadXMLDoc(xslFiles[0]);
          
          const contentDiv = document.getElementById("content");
          contentDiv.innerHTML = ""; // クリア

          if (window.ActiveXObject || "ActiveXObject" in window) {
              // IE Legacy support
              const ex = xml.transformNode(xsl);
              contentDiv.innerHTML = ex;
              // 変換後にスタイル修正を実行
              forceWrapStyles();
          } else if (document.implementation && document.implementation.createDocument) {
              const xsltProcessor = new XSLTProcessor();
              xsltProcessor.importStylesheet(xsl);
              const resultDocument = xsltProcessor.transformToFragment(xml, document);
              contentDiv.appendChild(resultDocument);
              
              // 変換後にスタイル修正を実行
              forceWrapStyles();
          }
      } catch (error) {
          console.error("Error displaying XML:", error);
      }
  } else {
      alert("Please drop a folder containing both XML and XSL files.");
  }
}

function handleDragOver(event) {
  event.preventDefault();
}

document.getElementById('drop_zone').addEventListener('dragover', handleDragOver, false);
document.getElementById('drop_zone').addEventListener('drop', handleDrop, false);
