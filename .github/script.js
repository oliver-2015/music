const audioFile = document.getElementById('audioFile');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

// 设置画布大小
canvas.width = window.innerWidth * 0.8;
canvas.height = 300;

let audioContext;
let analyser;
let dataArray;
let animationId;
let audioSource;

// 初始化音频上下文和分析器
function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
}

// 绘制可视化效果
function draw() {
    animationId = requestAnimationFrame(draw);
    
    analyser.getByteFrequencyData(dataArray);
    
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let x = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
        const barHeight = dataArray[i] * 2;
        
        const hue = i * 2;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
    }
}

// 处理文件选择
audioFile.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileReader = new FileReader();
    fileReader.onload = function() {
        const arrayBuffer = this.result;
        audioContext.decodeAudioData(arrayBuffer, function(buffer) {
            if (audioSource) {
                audioSource.disconnect();
            }
            
            audioSource = audioContext.createBufferSource();
            audioSource.buffer = buffer;
            audioSource.connect(analyser);
            analyser.connect(audioContext.destination);
            
            playButton.disabled = false;
            pauseButton.disabled = false;
        });
    };
    fileReader.readAsArrayBuffer(file);
});

// 播放按钮事件
playButton.addEventListener('click', function() {
    if (audioSource) {
        audioContext.resume();
        audioSource.start(0);
        draw();
    }
});

// 暂停按钮事件
pauseButton.addEventListener('click', function() {
    if (audioSource) {
        audioContext.suspend();
        cancelAnimationFrame(animationId);
    }
});

// 初始化
initAudio();
playButton.disabled = true;
pauseButton.disabled = true;

// 窗口大小改变时调整画布大小
window.addEventListener('resize', function() {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = 300;
}); 