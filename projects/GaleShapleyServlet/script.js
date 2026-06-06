const TRAITS = ["Kind", "Funny", "Smart", "Brave", "Honest", "Calm"];
const BOY_NAMES = ["Alex", "James", "Michael", "David", "Daniel", "Matthew"];
const GIRL_NAMES = ["Emma", "Olivia", "Sophia", "Isabella", "Mia", "Amelia"];
const BOY_PROFILES = ["🐉", "🦁", "🐺", "🦅", "🐻", "🐍"];
const GIRL_PROFILES = ["🦄", "🐱", "🦊", "🐰", "🐝", "🦋"];

function getRandomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function getRandomUniqueItems(arr, count) {
    let shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}

function getSelectedCheckboxes(containerId) {
    let checkboxes = document.querySelectorAll(`#${containerId} input:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

function setCheckboxValues(containerId, values) {
    let checkboxes = document.querySelectorAll(`#${containerId} input`);
    checkboxes.forEach(cb => cb.checked = values.includes(cb.value));
}

function getPersonalityTraits(prefix) {
    let t1 = document.getElementById(`${prefix}trait1`).value;
    let t2 = document.getElementById(`${prefix}trait2`).value;
    let t3 = document.getElementById(`${prefix}trait3`).value;
    return [t1, t2, t3];
}

function setPersonalityTraits(prefix, traits) {
    document.getElementById(`${prefix}trait1`).value = traits[0];
    document.getElementById(`${prefix}trait2`).value = traits[1];
    document.getElementById(`${prefix}trait3`).value = traits[2];
}

function getProfile(prefix) { return document.getElementById(`${prefix}profile`).value; }

function setProfile(prefix, profile) { document.getElementById(`${prefix}profile`).value = profile; }

function randomizePerson(prefix, isBoy, usedProfiles) {
    let nameList = isBoy ? BOY_NAMES : GIRL_NAMES;
    document.getElementById(prefix).value = getRandomItem(nameList);
    
    let profileList = isBoy ? BOY_PROFILES : GIRL_PROFILES;
    let available = profileList.filter(p => !usedProfiles.includes(p));
    if (available.length > 0) {
        let profile = getRandomItem(available);
        setProfile(prefix, profile);
        usedProfiles.push(profile);
    }
    
    let traits = getRandomUniqueItems(TRAITS, 3);
    setPersonalityTraits(prefix, traits);
    
    let likes = getRandomUniqueItems(TRAITS, 3);
    setCheckboxValues(`${prefix}likes`, likes);
}

function randomizeAll() {
    let usedBoyProfiles = [], usedGirlProfiles = [];
    for (let i = 1; i <= 3; i++) {
        randomizePerson(`boy${i}`, true, usedBoyProfiles);
        randomizePerson(`girl${i}`, false, usedGirlProfiles);
    }
    alert("🎲 All data randomized! Click 'Score Breakdown' to see compatibility details.");
}

function clearAll() {
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`boy${i}`).value = "";
        document.getElementById(`boy${i}profile`).value = "👦";
        document.getElementById(`girl${i}`).value = "";
        document.getElementById(`girl${i}profile`).value = "👧";
        for (let t = 1; t <= 3; t++) {
            document.getElementById(`boy${i}trait${t}`).value = "Kind";
            document.getElementById(`girl${i}trait${t}`).value = "Kind";
        }
        document.querySelectorAll(`#boy${i}likes input`).forEach(cb => cb.checked = false);
        document.querySelectorAll(`#girl${i}likes input`).forEach(cb => cb.checked = false);
    }
    alert("🧹 All fields cleared!");
}

function calculateScore(traits, likes) {
    let score = 0;
    for (let t of traits) if (likes.includes(t)) score++;
    return score;
}

function generatePreferences(people, targetGroup) {
    let prefs = [];
    for (let p of people) {
        let scores = [];
        for (let t of targetGroup) {
            scores.push({ name: t.name, score: calculateScore(t.traits, p.likes) });
        }
        scores.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
        prefs.push(scores.map(s => s.name));
    }
    return prefs;
}

// Modal functions
function openModal(content) {
    const modal = document.getElementById("breakdownModal");
    const modalBody = document.getElementById("modalBody");
    modalBody.innerHTML = content;
    modal.style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById("breakdownModal");
    modal.style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("breakdownModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

// Compatibility Score Breakdown - Clean format with traits
function showCompatibilityBreakdown() {
    let boys = [], girls = [];
    
    for (let i = 1; i <= 3; i++) {
        let name = document.getElementById(`boy${i}`).value.trim();
        let traits = getPersonalityTraits(`boy${i}`);
        let likes = getSelectedCheckboxes(`boy${i}likes`);
        let profile = getProfile(`boy${i}`);
        if (!name) { alert(`Boy ${i} name missing`); return; }
        if (likes.length !== 3) { alert(`${name}: Please select exactly 3 traits you like`); return; }
        boys.push({ name, traits, likes, profile });
    }
    
    for (let i = 1; i <= 3; i++) {
        let name = document.getElementById(`girl${i}`).value.trim();
        let traits = getPersonalityTraits(`girl${i}`);
        let likes = getSelectedCheckboxes(`girl${i}likes`);
        let profile = getProfile(`girl${i}`);
        if (!name) { alert(`Girl ${i} name missing`); return; }
        if (likes.length !== 3) { alert(`${name}: Please select exactly 3 traits you like`); return; }
        girls.push({ name, traits, likes, profile });
    }
    
    let html = `
        <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 12px; margin-bottom: 15px;">
            <strong>📊 How it works:</strong> Score = How many of their traits match what you LIKE<br>
            <span style="font-size: 11px;">✅ Green = Good match &nbsp;|&nbsp; 🟡 Yellow = Medium &nbsp;|&nbsp; 🔴 Red = Low</span>
        </div>
    `;
    
    // Group A → Group B
    html += `<div class="section-divider">👦 GROUP A → 👧 GROUP B</div>`;
    
    for (let boy of boys) {
        html += `<div class="compat-card">
            <div class="compat-header">🎯 ${boy.profile} ${boy.name} <span style="font-size: 11px;">likes: [${boy.likes.join(", ")}]</span></div>`;
        
        for (let girl of girls) {
            let matchedTraits = [];
            let score = 0;
            for (let trait of girl.traits) {
                if (boy.likes.includes(trait)) {
                    matchedTraits.push(trait);
                    score++;
                }
            }
            
            let scoreClass = score === 3 ? "score-high" : (score >= 2 ? "score-medium" : "score-low");
            let hearts = score === 3 ? "💖💖💖" : (score === 2 ? "💖💖" : (score === 1 ? "💖" : "💔"));
            
            html += `<div class="compat-row">
                <div class="compat-name">${girl.profile} ${girl.name}</div>
                <div class="compat-score"><span class="score-badge ${scoreClass}">${score}/3</span> ${hearts}</div>
                <div class="compat-traits">
                    ${matchedTraits.length > 0 ? `<span class="match-trait">✓ ${matchedTraits.join(", ")}</span>` : 'No matches'}
                </div>
            </div>`;
        }
        html += `</div>`;
    }
    
    // Group B → Group A
    html += `<div class="section-divider">👧 GROUP B → 👦 GROUP A</div>`;
    
    for (let girl of girls) {
        html += `<div class="compat-card">
            <div class="compat-header">🎯 ${girl.profile} ${girl.name} <span style="font-size: 11px;">likes: [${girl.likes.join(", ")}]</span></div>`;
        
        for (let boy of boys) {
            let matchedTraits = [];
            let score = 0;
            for (let trait of boy.traits) {
                if (girl.likes.includes(trait)) {
                    matchedTraits.push(trait);
                    score++;
                }
            }
            
            let scoreClass = score === 3 ? "score-high" : (score >= 2 ? "score-medium" : "score-low");
            let hearts = score === 3 ? "💖💖💖" : (score === 2 ? "💖💖" : (score === 1 ? "💖" : "💔"));
            
            html += `<div class="compat-row">
                <div class="compat-name">${boy.profile} ${boy.name}</div>
                <div class="compat-score"><span class="score-badge ${scoreClass}">${score}/3</span> ${hearts}</div>
                <div class="compat-traits">
                    ${matchedTraits.length > 0 ? `<span class="match-trait">✓ ${matchedTraits.join(", ")}</span>` : 'No matches'}
                </div>
            </div>`;
        }
        html += `</div>`;
    }
    
    html += `<div class="section-divider" style="margin-top: 15px;">💡 Gale-Shapley Algorithm</div>
    <div style="background: rgba(255,255,255,0.08); border-radius: 12px; padding: 10px; font-size: 12px;">
        • Each person is RANKED by compatibility score (highest to lowest)<br>
        • Higher score = Higher preference = More likely to propose first<br>
        • Group A proposes to Group B, Group B accepts/rejects based on their preferences<br>
        • Result: STABLE matches where no one prefers someone else over their partner
    </div>`;
    
    openModal(html);
}

function saveData() {
    let boys = [], girls = [];
    
    for (let i = 1; i <= 3; i++) {
        let name = document.getElementById(`boy${i}`).value.trim();
        let traits = getPersonalityTraits(`boy${i}`);
        let likes = getSelectedCheckboxes(`boy${i}likes`);
        let profile = getProfile(`boy${i}`);
        if (!name) { alert(`Boy ${i} name missing`); return; }
        if (likes.length !== 3) { alert(`${name}: select exactly 3 likes`); return; }
        boys.push({ name, traits, likes, profile });
    }
    
    for (let i = 1; i <= 3; i++) {
        let name = document.getElementById(`girl${i}`).value.trim();
        let traits = getPersonalityTraits(`girl${i}`);
        let likes = getSelectedCheckboxes(`girl${i}likes`);
        let profile = getProfile(`girl${i}`);
        if (!name) { alert(`Girl ${i} name missing`); return; }
        if (likes.length !== 3) { alert(`${name}: select exactly 3 likes`); return; }
        girls.push({ name, traits, likes, profile });
    }
    
    let boyPrefs = generatePreferences(boys, girls);
    let girlPrefs = generatePreferences(girls, boys);
    
    let data = {
        boys: boys.map((b, i) => ({ name: b.name, profile: b.profile, preferences: boyPrefs[i] })),
        girls: girls.map((g, i) => ({ name: g.name, profile: g.profile, preferences: girlPrefs[i] }))
    };
    
    console.log("Saving data:", JSON.stringify(data, null, 2));
    localStorage.setItem("matchingData", JSON.stringify(data));
    window.location.href = "simulation.html";
}

console.log("script.js loaded!");