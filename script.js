document.addEventListener("DOMContentLoaded", function() {
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const statsCard = document.querySelector(".stats-card");
    const easyCircle = document.querySelector(".easy-progress");
    const mediumCircle = document.querySelector(".medium-progress");
    const hardCircle = document.querySelector(".hard-progress");
    const progressSection = document.querySelector(".progress");

    // Initialize - clear labels but keep circles visible
    function initializeView() {
        progressSection.style.display = "flex";
        easyLabel.innerHTML = "";
        mediumLabel.innerHTML = "";
        hardLabel.innerHTML = "";
        statsCard.innerHTML = "";
        updateProgress(easyCircle, 0, 1);
        updateProgress(mediumCircle, 0, 1);
        updateProgress(hardCircle, 0, 1);
    }

    // Initialize on page load
    initializeView();

    function validateUsername(username) {
        if(username.trim() === ""){
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if(!isMatching){
            alert("Invalid Username");
        }
        return isMatching;
    }

    function updateProgress(circle, solved, total) {
        const percentage = total > 0 ? (solved / total) * 100 : 0;
        const degrees = (percentage / 100) * 360;
        circle.style.setProperty('--progress-degree', `${degrees}deg`);
    }

    function displayUserData(data) {
        const totalQuestions = data.data.allQuestionsCount;
        const solvedStats = data.data.matchedUser.submitStats.acSubmissionNum;

        // Find stats by difficulty
        const easySolved = solvedStats.find(item => item.difficulty === "Easy")?.count || 0;
        const mediumSolved = solvedStats.find(item => item.difficulty === "Medium")?.count || 0;
        const hardSolved = solvedStats.find(item => item.difficulty === "Hard")?.count || 0;

        const easyTotal = totalQuestions.find(item => item.difficulty === "Easy")?.count || 0;
        const mediumTotal = totalQuestions.find(item => item.difficulty === "Medium")?.count || 0;
        const hardTotal = totalQuestions.find(item => item.difficulty === "Hard")?.count || 0;

        // Show progress section
        progressSection.style.display = "flex";

        // Update labels with numbers
        easyLabel.innerHTML = `${easySolved}<br>${easyTotal}`;
        mediumLabel.innerHTML = `${mediumSolved}<br>${mediumTotal}`;
        hardLabel.innerHTML = `${hardSolved}<br>${hardTotal}`;

        // Update progress circles
        updateProgress(easyCircle, easySolved, easyTotal);
        updateProgress(mediumCircle, mediumSolved, mediumTotal);
        updateProgress(hardCircle, hardSolved, hardTotal);

        // Update stats card
        const totalSolved = easySolved + mediumSolved + hardSolved;
        const totalProblems = easyTotal + mediumTotal + hardTotal;
        
        statsCard.innerHTML = `
            <div class="card-item">
                <h3>Total Solved</h3>
                <p>${totalSolved} / ${totalProblems}</p>
            </div>
            <div class="card-item">
                <h3>Easy</h3>
                <p>${easySolved} / ${easyTotal}</p>
            </div>
            <div class="card-item">
                <h3>Medium</h3>
                <p>${mediumSolved} / ${mediumTotal}</p>
            </div>
            <div class="card-item">
                <h3>Hard</h3>
                <p>${hardSolved} / ${hardTotal}</p>
            </div>
        `;
    }

    async function fetchUserDetails(username){
    try{
        searchButton.textContent = "Searching...";
        searchButton.disabled = true;

        statsCard.innerHTML = "<p style='text-align: center; grid-column: 1/-1;'>Loading...</p>";

        const proxyUrl = 'https://corsproxy.io/?';
        const targetUrl = 'https://leetcode.com/graphql/';

        const myHeaders = new Headers();
        myHeaders.append("content-type", "application/json");

        const graphql = JSON.stringify({
            query: `
                query userSessionProgress($username: String!) {
                    allQuestionsCount {
                        difficulty
                        count
                    }
                    matchedUser(username: $username) {
                        submitStats {
                            acSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                        }
                    }
                }
            `,
            variables: { username }
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: graphql,
        };

        const response = await fetch(
            proxyUrl + encodeURIComponent(targetUrl),
            requestOptions
        );

        if(!response.ok){
            throw new Error("Unable to fetch user details");
        }

        const data = await response.json();

        if(!data.data || !data.data.matchedUser){
            throw new Error("User not found! Please check the username.");
        }

        displayUserData(data);
    }
    catch(error){
        console.error("Error:", error);
        initializeView();

        statsCard.innerHTML = `
            <p style="color: #ff6b6b; text-align: center; grid-column: 1/-1;">
                ❌ ${error.message}
            </p>
        `;
    }
    finally{
        searchButton.textContent = "Search";
        searchButton.disabled = false;
    }
}


    searchButton.addEventListener('click', function(){
        const username = usernameInput.value;
        console.log("Username: ", username);
        if(validateUsername(username)){
            fetchUserDetails(username);
        }
    });

    // Allow Enter key to search
    usernameInput.addEventListener('keypress', function(e){
        if(e.key === 'Enter'){
            searchButton.click();
        }
    });
});