// 创建场景
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

// 创建加载管理器
const loadingManager = new THREE.LoadingManager();
const loader = new THREE.GLTFLoader(loadingManager);
const loadingElement = document.getElementById('loading');

// 加载进度处理
loadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
    loadingElement.style.display = 'block';
    loadingElement.textContent = `加载中... ${Math.round(itemsLoaded / itemsTotal * 100)}%`;
};

loadingManager.onLoad = function() {
    loadingElement.style.display = 'none';
};

// 加载3D模型
let model;
function loadModel(modelPath) {
    loader.load(
        modelPath,
        function(gltf) {
            if (model) {
                scene.remove(model);
            }
            
            model = gltf.scene;
            
            // 自动调整模型大小和位置
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 5 / maxDim;
            model.scale.setScalar(scale);
            
            model.position.sub(center.multiplyScalar(scale));
            model.position.y = 0;
            
            // 确保模型接收和投射阴影
            model.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            
            scene.add(model);
        },
        function(xhr) {
            // 加载进度
            const percent = (xhr.loaded / xhr.total * 100);
            loadingElement.textContent = `加载中... ${Math.round(percent)}%`;
        },
        function(error) {
            console.error('模型加载出错:', error);
            loadingElement.textContent = '模型加载失败';
            setTimeout(() => {
                loadingElement.style.display = 'none';
            }, 2000);
        }
    );
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
ground.receiveShadow = true;
scene.add(ground);

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// 处理窗口大小变化
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});

// 开始动画循环
animate();

// 导出加载模型的函数，这样可以从外部调用
window.loadModel = loadModel;

loadModel('/assets/models/your-model.glb'); 