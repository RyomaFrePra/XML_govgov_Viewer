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
          // ここでは最初のXMLファイルと最初のXSLファイルを使用します
          const xml = await loadXMLDoc(xmlFiles[0]);
          const xsl = await loadXMLDoc(xslFiles[0]);
          
          if (window.ActiveXObject || "ActiveXObject" in window) {
              const ex = xml.transformNode(xsl);
              document.getElementById("content").innerHTML = ex;
          } else if (document.implementation && document.implementation.createDocument) {
              const xsltProcessor = new XSLTProcessor();
              xsltProcessor.importStylesheet(xsl);
              const resultDocument = xsltProcessor.transformToFragment(xml, document);
              document.getElementById("content").innerHTML = ""; // Clear previous content
              document.getElementById("content").appendChild(resultDocument);
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
