const express = require("express");
const router = express.Router();

module.exports = (pool, verifyToken) => {
  // Import route modules (excluding auth since it's handled in server.js)
  const residentRoutes = require("./residents")(pool, verifyToken);
  const complaintRoutes = require("./complaints")(pool, verifyToken);
  const complaintCategoryRoutes = require("./complaint-categories")(
    pool,
    verifyToken
  );
  const blotterRoutes = require("./blotters")(pool, verifyToken);
  const activityLogRoutes = require("./activity-logs")(pool, verifyToken);
  const loginRoutes = require("./logins")(pool, verifyToken);
  const dashboardRoutes = require("./dashboard")(pool, verifyToken);
  const healthRecordRoutes = require("./health-records")(pool, verifyToken);
  const userRoutes = require("./users")(pool, verifyToken);
  const maternalHealthRoutes = require("./maternal-health")(pool, verifyToken);
  const childImmunizationRoutes = require("./child-immunizations")(
    pool,
    verifyToken
  );
  const deathRoutes = require("./deaths")(pool, verifyToken);
  const logbookRoutes = require("./logbook")(pool, verifyToken);
  const referralRoutes = require("./referrals")(pool, verifyToken);
  const requestsRouter = require("./requests")(pool, verifyToken);
  const announcementsRoutes = require("./announcements")(pool, verifyToken);
  const eventsRoutes = require("./events")(pool, verifyToken);
  const householdRoutes = require("./households")(pool, verifyToken);
  const reportRoutes = require("./reports")(pool, verifyToken);
  const officialsRoutes = require("./officials")(pool, verifyToken);
  const spotmapsRoutes = require("./spotmaps")(pool, verifyToken);
  const notificationCountsRoutes = require("./notificationCounts")(
    pool,
    verifyToken
  );
  const projectsRoutes = require("./projects")(pool, verifyToken);
  const barangayHistoryRoutes = require("./barangay-history")(
    pool,
    verifyToken
  );

  // Use routes
  router.use("/residents", residentRoutes);
  router.use("/complaints", complaintRoutes);
  router.use("/complaint-categories", complaintCategoryRoutes);
  router.use("/blotters", blotterRoutes);
  router.use("/activity-logs", activityLogRoutes);
  router.use("/logins", loginRoutes);
  router.use("/dashboard", dashboardRoutes);
  router.use("/health-records", healthRecordRoutes);
  router.use("/users", userRoutes);
  router.use("/maternal-health", maternalHealthRoutes);
  router.use("/child-immunizations", childImmunizationRoutes);
  router.use("/deaths", deathRoutes);
  router.use("/logbook", logbookRoutes);
  router.use("/referrals", referralRoutes);
  router.use("/requests", requestsRouter);
  router.use("/announcements", announcementsRoutes);
  router.use("/events", eventsRoutes);
  router.use("/households", householdRoutes);
  router.use("/reports", reportRoutes);
  router.use("/officials", officialsRoutes);
  router.use("/spotmaps", spotmapsRoutes);
  router.use("/notifications", notificationCountsRoutes);
  router.use("/projects", projectsRoutes);
  router.use("/barangay-history", barangayHistoryRoutes);
  return router;
};
