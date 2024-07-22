document.addEventListener("DOMContentLoaded", function () {
  const startBtn = document.getElementById("start-timer");
  const stopBtn = document.getElementById("stop-timer");
  const logManualBtn = document.getElementById("log-manual-entry");
  const manualToggleBtn = document.getElementById("manual-entry-toggle");
  const timerForm = document.getElementById("timer-form");
  const manualForm = document.getElementById("manual-entry-form");
  const logList = document.getElementById("log-list");
  const analyticsChart = document.getElementById("analytics-chart");
  const showTrackerBtn = document.getElementById("show-tracker");
  const showAnalyticsBtn = document.getElementById("show-analytics");
  const presetTimer = document.getElementById("preset-timer");
  const customTimer = document.getElementById("custom-timer");
  let startTime, endTime, timerInterval;
  let elapsedTime = 0;
  let timerDuration = 0;
  let timerDisplay = document.getElementById("timer-display");

  showTrackerBtn.addEventListener("click", function () {
    document.getElementById("tracker").classList.remove("hidden");
    document.getElementById("logs").classList.remove("hidden");
    document.getElementById("analytics").classList.add("hidden");
  });

  showAnalyticsBtn.addEventListener("click", function () {
    document.getElementById("tracker").classList.add("hidden");
    document.getElementById("logs").classList.add("hidden");
    document.getElementById("analytics").classList.remove("hidden");
    renderAnalytics();
  });

  startBtn.addEventListener("click", function () {
    const presetValue = parseInt(presetTimer.value);
    const customValue = parseInt(customTimer.value) * 60;

    if (!isNaN(presetValue) && presetValue > 0) {
      timerDuration = presetValue;
    } else if (!isNaN(customValue) && customValue > 0) {
      timerDuration = customValue;
    } else {
      timerDuration = 0;
    }

    startTime = new Date();
    elapsedTime = 0;
    timerForm.classList.remove("hidden");
    startBtn.classList.add("hidden");
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
  });

  stopBtn.addEventListener("click", function () {
    endTime = new Date();
    const taskDesc = document.getElementById("task-desc").value;
    logSession(taskDesc, startTime, endTime);
    resetTimer();
  });

  logManualBtn.addEventListener("click", function () {
    const taskDesc = document.getElementById("manual-task-desc").value;
    const startTime = new Date(document.getElementById("start-time").value);
    const endTime = new Date(document.getElementById("end-time").value);
    logSession(taskDesc, startTime, endTime);
    resetManualForm();
  });

  manualToggleBtn.addEventListener("click", function () {
    manualForm.classList.toggle("hidden");
  });

  function updateTimer() {
    const now = new Date();
    elapsedTime = Math.floor((now - startTime) / 1000);
    if (timerDuration > 0 && elapsedTime >= timerDuration) {
      elapsedTime = timerDuration;
      clearInterval(timerInterval);
    }
    timerDisplay.textContent = formatTime(elapsedTime);
  }

  function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs
      .toString()
      .padStart(
        2,
        "0"
      )}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function resetTimer() {
    clearInterval(timerInterval);
    document.getElementById("task-desc").value = "";
    timerDisplay.textContent = "00:00:00";
    timerForm.classList.add("hidden");
    startBtn.classList.remove("hidden");
    presetTimer.value = "";
    customTimer.value = "";
  }

  function resetManualForm() {
    document.getElementById("manual-task-desc").value = "";
    document.getElementById("start-time").value = "";
    document.getElementById("end-time").value = "";
    manualForm.classList.add("hidden");
  }

  function logSession(taskDesc, startTime, endTime) {
    const duration = Math.floor((endTime - startTime) / 1000);
    const log = {
      taskDesc,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
    };
    const logs = getLogs();
    logs.push(log);
    localStorage.setItem("logs", JSON.stringify(logs));
    renderLogs();
  }

  function getLogs() {
    return JSON.parse(localStorage.getItem("logs")) || [];
  }

  function renderLogs() {
    const logs = getLogs();
    logList.innerHTML = "";
    logs.forEach((log, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
              <div>
                  <strong>${log.taskDesc}</strong><br>
                  ${new Date(log.startTime).toLocaleString()} - ${new Date(
        log.endTime
      ).toLocaleString()}<br>
                  Duration: ${formatTime(log.duration)}
              </div>
              <button class="delete-log" data-index="${index}">Delete</button>
          `;
      logList.appendChild(li);
    });
    document.querySelectorAll(".delete-log").forEach((button) => {
      button.addEventListener("click", function () {
        const index = this.getAttribute("data-index");
        deleteLog(index);
      });
    });
  }

  function deleteLog(index) {
    const logs = getLogs();
    logs.splice(index, 1);
    localStorage.setItem("logs", JSON.stringify(logs));
    renderLogs();
  }

  function renderAnalytics() {
    const logs = getLogs();
    const ctx = analyticsChart.getContext("2d");
    const data = logs.reduce((acc, log) => {
      const date = new Date(log.startTime).toLocaleDateString();
      const duration = Math.floor(log.duration / 60);
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += duration;
      return acc;
    }, {});

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            label: "Time Spent (minutes)",
            data: Object.values(data),
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: "Date",
            },
          },
          y: {
            title: {
              display: true,
              text: "Minutes",
            },
          },
        },
      },
    });
  }

  renderLogs();
});
