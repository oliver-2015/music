const audioFile = document.getElementById('audioFile');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');

let audioContext;
let analyser;
let dataArray;
let animationId;
let audioSource;

// 创建3D场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
document.getElementById('3d-container').appendChild(renderer.domElement);

// 创建控制器
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 添加光照
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 创建音频响应的立方体组
const cubes = [];
const cubeCount = 32; // 频谱柱体数量
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });

for (let i = 0; i < cubeCount; i++) {
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial.clone());
    cube.position.x = (i - cubeCount/2) * 1.5;
    cube.position.y = 0;
    cube.castShadow = true;
    cube.receiveShadow = true;
    cubes.push(cube);
    scene.add(cube);
}

// 创建地面
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x808080,
    roughness: 0.8,
    metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2;
ground.receiveShadow = true;
scene.add(ground);

// 初始化音频上下文和分析器
function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 64; // 减小以匹配立方体数量
    dataArray = new Uint8Array(analyser.frequencyBinCount);
}

// 动画循环
function animate() {
    animationId = requestAnimationFrame(animate);
    
    if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        
        // 更新立方体高度和颜色
        cubes.forEach((cube, i) => {
            const value = dataArray[i];
            const height = value / 25; // 调整频谱响应高度
            cube.scale.y = height || 0.1;
            cube.position.y = height / 2 - 1;
            
            // 根据频率设置颜色
            const hue = (i / cubeCount) * 360;
            cube.material.color.setHSL(hue/360, 1, height/5);
        });
    }
    
    controls.update();
    renderer.render(scene, camera);
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
        animate();
    }
});

// 暂停按钮事件
pauseButton.addEventListener('click', function() {
    if (audioSource) {
        audioContext.suspend();
        cancelAnimationFrame(animationId);
    }
});

// 处理窗口大小变化
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// 初始化
initAudio();
playButton.disabled = true;
pauseButton.disabled = true;
animate(); 