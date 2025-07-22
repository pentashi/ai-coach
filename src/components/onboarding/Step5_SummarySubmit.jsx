import React from "react";

export default function Step5_SummarySubmit({ profile }) {
  return (
    <>
      <h5>Review Your Information</h5>
      <ul className="list-group">
        <li className="list-group-item">
          <strong>Name:</strong> {profile.name}
        </li>
        <li className="list-group-item">
          <strong>Age:</strong> {profile.age}
        </li>
        <li className="list-group-item">
          <strong>Gender:</strong> {profile.gender}
        </li>
        <li className="list-group-item">
          <strong>Height:</strong> {profile.height} cm
        </li>
        <li className="list-group-item">
          <strong>Weight:</strong> {profile.weight} kg
        </li>
        <li className="list-group-item">
          <strong>Fitness Goals:</strong> {profile.fitnessGoals.join(", ")}
        </li>
        <li className="list-group-item">
          <strong>Experience Level:</strong> {profile.experienceLevel}
        </li>
        <li className="list-group-item">
          <strong>Workout Split:</strong> {profile.workoutSplit}
        </li>
        <li className="list-group-item">
          <strong>Training Days per Week:</strong> {profile.trainingDaysPerWeek}
        </li>
        <li className="list-group-item">
          <strong>Workout Duration:</strong> {profile.workoutDurationMinutes} min
        </li>
        <li className="list-group-item">
          <strong>Preferred Training Time:</strong> {profile.preferredTrainingTime}
        </li>
        <li className="list-group-item">
          <strong>Training Environment:</strong> {profile.trainingEnvironment}
        </li>
        <li className="list-group-item">
          <strong>Injury History:</strong> {profile.injuryHistory || "None"}
        </li>
        <li className="list-group-item">
          <strong>Mobility Restrictions:</strong> {profile.mobilityRestrictions || "None"}
        </li>
        <li className="list-group-item">
          <strong>Exercise Restrictions:</strong> {profile.exerciseRestrictions || "None"}
        </li>
        <li className="list-group-item">
          <strong>Physical Activity Level:</strong> {profile.physicalActivityLevel || "None"}
        </li>
        <li className="list-group-item">
          <strong>Body Fat %:</strong> {profile.bodyFatPercentage || "N/A"}
        </li>
        <li className="list-group-item">
          <strong>Muscle Mass:</strong> {profile.muscleMass || "N/A"}
        </li>
        <li className="list-group-item">
          <strong>Waist Circumference:</strong> {profile.waistCircumference || "N/A"}
        </li>
        <li className="list-group-item">
          <strong>Dietary Preference:</strong> {profile.dietaryPreference || "None"}
        </li>
        <li className="list-group-item">
          <strong>Sleep Quality:</strong> {profile.sleepQuality || "None"}
        </li>
        <li className="list-group-item">
          <strong>Stress Level:</strong> {profile.stressLevel || "None"}
        </li>
        <li className="list-group-item">
          <strong>Motivation Level:</strong> {profile.motivationLevel}
        </li>
        <li className="list-group-item">
          <strong>Goal Timeline:</strong> {profile.goalTimeline}
        </li>
        <li className="list-group-item">
          <strong>Motivation:</strong> {profile.motivation || "None"}
        </li>
        <li className="list-group-item">
          <strong>Additional Notes:</strong> {profile.additionalNotes || "None"}
        </li>
        <li className="list-group-item">
          <strong>Accountability Preferences:</strong>{" "}
          {profile.accountabilityPreferences || "None"}
        </li>
        {profile.photoUrl && (
          <li className="list-group-item">
            <strong>Uploaded Photo:</strong>
            <div className="mt-2">
              <img
                src={profile.photoUrl}
                alt="Uploaded progress"
                style={{ maxWidth: "100%", borderRadius: "1rem" }}
              />
            </div>
          </li>
        )}
      </ul>
    </>
  );
}
