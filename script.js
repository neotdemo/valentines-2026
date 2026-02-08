const anniversaryDate = new Date("2024-07-26T00:00:00");

function updateClock() {
    const now = new Date();
    const diff = now - anniversaryDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    document.getElementById('clock').textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
setInterval(updateClock, 1000);

function updatePath() {
    const pathLine = document.getElementById('path-line');
    const svgCanvas = document.getElementById('svg-canvas');
    const nodes = document.querySelectorAll('.connector-node');
    
    const fullHeight = document.documentElement.scrollHeight;
    const fullWidth = window.innerWidth;
    svgCanvas.setAttribute('height', fullHeight);
    svgCanvas.setAttribute('viewBox', `0 0 ${fullWidth} ${fullHeight}`);

    if (nodes.length < 2) return;

    let d = "";
    const scrollY = window.scrollY;

    nodes.forEach((node, index) => {
        const rect = node.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const nodeTop = rect.top + scrollY;
        const nodeBottom = rect.bottom + scrollY;

        if (index === 0) {
            d += `M ${centerX} ${nodeBottom}`;
        } else if (index === nodes.length - 1) {
            // STOP AT TOP OF FINAL CARD
            const prevRect = nodes[index - 1].getBoundingClientRect();
            const prevCenterX = prevRect.left + prevRect.width / 2;
            const prevBottom = prevRect.bottom + scrollY;
            d += ` C ${prevCenterX} ${prevBottom + 120}, ${centerX} ${nodeTop - 120}, ${centerX} ${nodeTop}`;
        } else {
            // MIDDLE NODES: CONNECT TOP AND BOTTOM
            const prevRect = nodes[index - 1].getBoundingClientRect();
            const prevCenterX = prevRect.left + prevRect.width / 2;
            const prevBottom = prevRect.bottom + scrollY;
            d += ` C ${prevCenterX} ${prevBottom + 120}, ${centerX} ${nodeTop - 120}, ${centerX} ${nodeTop}`;
            d += ` L ${centerX} ${nodeBottom}`;
        }
    });

    pathLine.setAttribute('d', d);

    const pathLength = pathLine.getTotalLength();
    pathLine.style.strokeDasharray = pathLength;
    animatePath();
}

// 3. OBSERVE BOX SIZES
const resizeObserver = new ResizeObserver(() => {
    updatePath();
});

document.querySelectorAll('.connector-node').forEach(node => {
    resizeObserver.observe(node);
});

// 4. ANIMATE ON SCROLL
function animatePath() {
    const pathLine = document.getElementById('path-line');
    const pathLength = pathLine.getTotalLength();
    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = window.scrollY / scrollTotal;
    pathLine.style.strokeDashoffset = pathLength * (1 - scrollProgress);
}

// 5. RESPONSE LOGIC
function handleResponse(isYes) {
    const container = document.getElementById('response-image-container');
    const questionText = document.querySelector('.main-question');
    container.innerHTML = ""; 

    const img = document.createElement('img');
    img.src = isYes ? 'assets/photos/IMG_0297.jpg' : 'assets/photos/IMG_0298.jpg'; 
    questionText.textContent = isYes ? "Yay!" : "Please reconsider?";
    container.appendChild(img);
    
    // Tiny delay to let the image render before recalculating the path
    setTimeout(updatePath, 50);
}

// LISTENERS
window.addEventListener('load', updatePath);
window.addEventListener('scroll', animatePath);
window.addEventListener('resize', updatePath);
updateClock();