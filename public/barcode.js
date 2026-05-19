navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log("Camera access granted");
  })
  .catch(err => {
    console.error("Camera access denied:", err);
    alert("Please enable camera access in your browser settings.");
  });



// Detect if user is on mobile
function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// Choose facingMode based on device
const facingMode = isMobileDevice() ? "environment" : "user";

const config = {
  inputStream: {
    name: "Live",
    type: "LiveStream",
    target: document.querySelector('#interactive-viewport'),
    constraints: {
      width: 640,
      height: 480,
      facingMode: { ideal: isMobileDevice() ? "environment" : "user" }

    }
  },
  decoder: {
    readers: ["code_128_reader", "ean_reader", "upc_reader"]
  },
  locate: true
};

Quagga.init(config, function(err) {
  if (err) {
    console.error("Error initializing Quagga:", err);
    return;
  }
  console.log("Initialization finished. Ready to start.");
  Quagga.start();
});

Quagga.onDetected(function(data) {
  console.log("Barcode detected:", data.codeResult.code);
  document.getElementById('result').textContent = data.codeResult.code;
});

function stopScanner() {
  Quagga.stop();
  console.log("Scanner stopped.");
}




// Customize the detection box color (e.g., to blue)
Quagga.onProcessed(function(result) {
    var drawingCtx = Quagga.canvas.ctx.overlay,
        drawingCanvas = Quagga.canvas.dom.overlay;

    if (result && result.boxes) {
        // Clear previous frames and draw detection paths
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        
        result.boxes.forEach(function(box) {
            Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
        });
    }
});
