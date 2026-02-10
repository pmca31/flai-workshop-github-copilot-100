document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create title
        const title = document.createElement("h4");
        title.textContent = name;
        activityCard.appendChild(title);

        // Create description
        const description = document.createElement("p");
        description.textContent = details.description;
        activityCard.appendChild(description);

        // Create schedule
        const schedule = document.createElement("p");
        const scheduleLabel = document.createElement("strong");
        scheduleLabel.textContent = "Schedule: ";
        schedule.appendChild(scheduleLabel);
        schedule.appendChild(document.createTextNode(details.schedule));
        activityCard.appendChild(schedule);

        // Create availability
        const availability = document.createElement("p");
        const availabilityLabel = document.createElement("strong");
        availabilityLabel.textContent = "Availability: ";
        availability.appendChild(availabilityLabel);
        availability.appendChild(document.createTextNode(`${spotsLeft} spots left`));
        activityCard.appendChild(availability);

        // Create participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";
        
        const participantsLabel = document.createElement("strong");
        participantsLabel.textContent = "Participants:";
        participantsSection.appendChild(participantsLabel);

        if (details.participants.length > 0) {
          const participantsList = document.createElement("div");
          participantsList.className = "participants-list";

          details.participants.forEach((email) => {
            const participantItem = document.createElement("div");
            participantItem.className = "participant-item";

            const emailSpan = document.createElement("span");
            emailSpan.className = "participant-email";
            emailSpan.textContent = email;
            participantItem.appendChild(emailSpan);

            const deleteIcon = document.createElement("span");
            deleteIcon.className = "delete-icon";
            deleteIcon.title = "Remove participant";
            deleteIcon.textContent = "🗑️";
            deleteIcon.setAttribute("role", "button");
            deleteIcon.setAttribute("aria-label", "Remove participant");
            deleteIcon.setAttribute("tabindex", "0");
            
            const handleDelete = async () => {
              // Create a safe confirmation message
              const confirmMsg = `Remove participant from activity?\n\nParticipant: ${email}\nActivity: ${name}`;
              if (!confirm(confirmMsg)) return;
              try {
                const response = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(email)}`, {
                  method: "POST",
                });
                if (response.ok) {
                  fetchActivities();
                } else {
                  const result = await response.json();
                  alert(result.detail || "Failed to remove participant.");
                }
              } catch (error) {
                alert("Error removing participant.");
              }
            };
            
            // Store data in closure instead of data attributes for better security
            deleteIcon.addEventListener("click", handleDelete);
            deleteIcon.addEventListener("keydown", (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleDelete();
              }
            });

            participantItem.appendChild(deleteIcon);
            participantsList.appendChild(participantItem);
          });

          participantsSection.appendChild(participantsList);
        } else {
          const noParticipants = document.createElement("p");
          noParticipants.className = "participants-none";
          noParticipants.textContent = "No participants yet.";
          participantsSection.appendChild(noParticipants);
        }

        activityCard.appendChild(participantsSection);
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
