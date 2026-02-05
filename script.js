document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsCard = document.querySelector(".stats-card");

    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");

    const easyCircle = document.querySelector(".easy-progress");
    const mediumCircle = document.querySelector(".medium-progress");
    const hardCircle = document.querySelector(".hard-progress");

    function updateProgress(circle, solved, total) {
        const percentage = total ? (solved / total) * 100 : 0;
        const degrees = (percentage / 100) * 360;
        circle.style.setProperty("--progress-degree", `${degrees}deg`);
    }

    function validateUsername(username) {
        return /^[a-zA-Z0-9_-]{1,15}$/.test(username);
    }

    async function fetchUserDetails(username) {
        try {
            searchButton.disabled = true;
            searchButton.textContent = "Searching...";
            statsCard.innerHTML = "<p class='loading-text'>Loading...</p>";

            const response = await fetch("/.netlify/functions/leetcode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username })
            });

            if (!response.ok) throw new Error("User not found");

            const data = await response.json();

            const total = data.data.allQuestionsCount;
            const solved = data.data.matchedUser.submitStats.acSubmissionNum;

            const get = (arr, d) => arr.find(x => x.difficulty === d)?.count || 0;

            const easySolved = get(solved, "Easy");
            const mediumSolved = get(solved, "Medium");
            const hardSolved = get(solved, "Hard");

            const easyTotal = get(total, "Easy");
            const mediumTotal = get(total, "Medium");
            const hardTotal = get(total, "Hard");

            easyLabel.innerHTML = `${easySolved}<br>${easyTotal}`;
            mediumLabel.innerHTML = `${mediumSolved}<br>${mediumTotal}`;
            hardLabel.innerHTML = `${hardSolved}<br>${hardTotal}`;

            updateProgress(easyCircle, easySolved, easyTotal);
            updateProgress(mediumCircle, mediumSolved, mediumTotal);
            updateProgress(hardCircle, hardSolved, hardTotal);

            statsCard.innerHTML = `
                <div class="card-item"><h3>Total Solved</h3><p>${easySolved + mediumSolved + hardSolved}</p></div>
                <div class="card-item"><h3>Easy</h3><p>${easySolved}</p></div>
                <div class="card-item"><h3>Medium</h3><p>${mediumSolved}</p></div>
                <div class="card-item"><h3>Hard</h3><p>${hardSolved}</p></div>
            `;
        } catch (err) {
            statsCard.innerHTML = `<p class="error-text">❌ ${err.message}</p>`;
        } finally {
            searchButton.disabled = false;
            searchButton.textContent = "Search";
        }
    }

    searchButton.addEventListener("click", () => {
        const username = usernameInput.value.trim();
        if (!validateUsername(username)) {
            alert("Invalid username");
            return;
        }
        fetchUserDetails(username);
    });

    usernameInput.addEventListener("keypress", e => {
        if (e.key === "Enter") searchButton.click();
    });
});
