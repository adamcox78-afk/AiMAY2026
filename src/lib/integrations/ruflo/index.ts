export { ruflo, RufloClient, type RufloStatus } from "./client";
export {
  RUFLO_WORKFLOWS,
  runMarketScan,
  runWatchlistScan,
  runConfidenceAlertSweep,
  runPredictionMarketAlertSweep,
  runSignalOutcomeLogger,
  runDailyPerformanceReport,
  runMediaBriefing,
  runLeadFollowups,
  type RufloWorkflowDef,
  type MarketScanResult,
  type HighConvictionHit,
  type PredictionMoveHit,
  type LeadFollowup,
} from "./workflows";
