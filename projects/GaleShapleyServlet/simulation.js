window.switchTab = function(tab) {
    let chatTab = document.getElementById("chatTab");
    let stepsTab = document.getElementById("stepsTab");
    let btns = document.querySelectorAll(".tab-btn");
    btns.forEach(btn => btn.classList.remove("active"));
    if (tab === 'chat') {
        chatTab.classList.add("active");
        stepsTab.classList.remove("active");
        btns[0].classList.add("active");
    } else {
        chatTab.classList.remove("active");
        stepsTab.classList.add("active");
        btns[1].classList.add("active");
    }
};

window.onload = function() {
    let data = JSON.parse(localStorage.getItem("matchingData"));
    if (!data) {
        alert("No data found. Please go back and click 'Initialize Matching'.");
        return;
    }
    
    console.log("Data loaded:", data);
    
    let chatLog = document.getElementById("chatLog");
    let stepsLog = document.getElementById("stepsLog");
    let matchesContainer = document.getElementById("matchesContainer");
    let boyDisplay = document.getElementById("boyDisplay");
    let girlDisplay = document.getElementById("girlDisplay");
    let boyProfile = document.getElementById("boyProfile");
    let girlProfile = document.getElementById("girlProfile");
    let statusBox = document.getElementById("statusBox");
    let progressBar = document.getElementById("progressBar");
    
    if (chatLog) chatLog.innerHTML = "";
    if (stepsLog) stepsLog.innerHTML = "";
    
    let boyMap = {}, girlMap = {};
    data.boys.forEach(b => boyMap[b.name] = b.profile || "👦");
    data.girls.forEach(g => girlMap[g.name] = g.profile || "👧");
    
    function addMessage(round, msg, type) {
        let colorClass = type === 'accept' ? 'accept-message' : (type === 'reject' ? 'reject-message' : 'proposal-message');
        let icon = type === 'propose' ? '💌' : (type === 'accept' ? '✅' : '❌');
        
        if (chatLog) {
            let div = document.createElement("div");
            div.className = `chat-message ${colorClass}`;
            div.innerHTML = `<span class="round-badge">${round}</span> ${icon} ${msg}`;
            chatLog.appendChild(div);
            div.scrollIntoView({ behavior: 'smooth' });
        }
        if (stepsLog) {
            let div = document.createElement("div");
            div.className = `chat-message ${colorClass}`;
            div.innerHTML = `<span class="round-badge">${round}</span> ${msg}`;
            stepsLog.appendChild(div);
        }
    }
    
    function updateVisuals(boy, girl, status) {
        if (boy && boyMap[boy]) { boyProfile.innerText = boyMap[boy]; boyDisplay.innerText = boy; }
        if (girl && girlMap[girl]) { girlProfile.innerText = girlMap[girl]; girlDisplay.innerText = girl; }
        statusBox.innerHTML = status;
    }
    
    function updateProgress(current, total) {
        if (progressBar) progressBar.style.width = `${(current/total)*100}%`;
    }
    
    // Run Gale-Shapley
   let steps = [];
let matches = [];

fetch("match", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
})
.then(response => response.json())
.then(result => {

    console.log("Servlet Result:", result);

    steps = result.steps.map((s, index) => {

        let msg = s.message;
        let type = "propose";

        if (msg.includes("accept")) {
            type = "accept";
        }
        else if (
            msg.includes("reject") ||
            msg.includes("prefers")
        ) {
            type = "reject";
        }

        let boy = "";
        let girl = "";

        Object.keys(boyMap).forEach(name => {
            if (msg.includes(name)) boy = name;
        });

        Object.keys(girlMap).forEach(name => {
            if (msg.includes(name)) girl = name;
        });

        return {
            round: index + 1,
            type,
            boy,
            girl,
            msg
        };

    });

    matches = result.matches.map(m => ({
        boy: m.boy,
        girl: m.girl,
        boyProfile: boyMap[m.boy],
        girlProfile: girlMap[m.girl]
    }));

    addMessage("✨", "🌟 Welcome to Gale-Shapley Simulation!", "accept");
    addMessage(
        "📋",
        `📋 ${data.boys.length} boys and ${data.girls.length} girls participating`,
        "accept"
    );

    setTimeout(nextStep, 1000);

})
.catch(error => {

    console.error(error);

    alert("Could not connect to MatchServlet.");

});
    
    let matches = boys.filter(b => b.match).map(b => ({ boy: b.name, boyProfile: b.profile, girl: b.match.name, girlProfile: b.match.profile }));
    
    
    let stepIdx = 0;
    function nextStep() {
        if (stepIdx >= steps.length) {
            statusBox.innerHTML = "✅ ALL MATCHES ARE STABLE! ✅";
            updateProgress(steps.length, steps.length);
            showMatches();
            return;
        }
        let s = steps[stepIdx];
        updateProgress(stepIdx + 1, steps.length);
        updateVisuals(s.boy, s.girl, s.type === 'propose' ? "💌 Proposing..." : (s.type === 'accept' ? "💖 Accepted!" : "💔 Rejected"));
        addMessage(s.round, s.msg, s.type);
        stepIdx++;
        setTimeout(nextStep, 1500);
    }
    
    function showMatches() {
        matchesContainer.innerHTML = "";
        if (matches.length === 0) {
            matchesContainer.innerHTML = "<div class='final-match-card'><p>No matches found</p></div>";
            return;
        }
        matches.forEach(m => {
            let card = document.createElement("div");
            card.className = "final-match-card";
            card.innerHTML = `
                <div class="final-match-profiles">
                    <span style="font-size:60px">${m.boyProfile || "👦"}</span>
                    <span style="font-size:40px">💖</span>
                    <span style="font-size:60px">${m.girlProfile || "👧"}</span>
                </div>
                <h3>${m.boy} & ${m.girl}</h3>
                <p>✨ Stable Match ✨</p>
            `;
            matchesContainer.appendChild(card);
        });
        addMessage("🎉", "🎉 ALL MATCHES ARE STABLE! 🎉", "accept");
    }
    
 
};