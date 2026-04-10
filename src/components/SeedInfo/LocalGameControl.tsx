import { FC, useState, useEffect, useRef, useMemo } from "react";
import { Form, Button, Spinner, Modal, Stack } from "react-bootstrap";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../services/db";
import { NoitaMemoryReaderService, SeedState } from "../../services/noitaMemoryReader";
import { NoitaLauncherService } from "../../services/noitaLauncher";
import { SeedMatcherService } from "../../services/seedMatcher";
import useLocalStorage from "../../services/useLocalStorage";

interface LocalGameControlProps {
  onSeedDetected: (seed: string) => void;
}

type LaunchStatus = "idle" | "loading" | "success" | "error";

const MAX_RESTART_FAILURES = 3;
const POLLING_INTERVAL_MS = 5000;

const LocalGameControl: FC<LocalGameControlProps> = ({ onSeedDetected }) => {
  // Services
  const memoryReaderRef = useRef(new NoitaMemoryReaderService());
  const launcherServiceRef = useRef(new NoitaLauncherService());
  const seedMatcherRef = useRef<SeedMatcherService | null>(null);

  // State
  const [pollingEnabled, setPollingEnabled] = useLocalStorage("local-game-control-polling-enabled", false);
  const [currentSeed, setCurrentSeed] = useState<number | null>(null);
  const [seedState, setSeedState] = useState<SeedState>("not-running");
  const [selectedSearchUUID, setSelectedSearchUUID] = useLocalStorage<string | null>(
    "local-game-control-selected-search",
    null,
  );
  const [launchStatus, setLaunchStatus] = useState<LaunchStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isAutoRestarting, setIsAutoRestarting] = useState(false);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  // Modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");

  // Track last checked seed to avoid duplicate checks
  const lastCheckedSeedRef = useRef<{ seed: number; searchUUID: string } | null>(null);

  // Load searches from database
  const searches = useLiveQuery(() => db.searches.toArray(), [], []);

  // Load unlocked spells for seed matching
  const [unlockedSpells] = useLocalStorage<boolean[] | undefined>("unlocked-spells", undefined);

  // Initialize seed matcher with unlocked spells
  useEffect(() => {
    seedMatcherRef.current = new SeedMatcherService(unlockedSpells);
  }, [unlockedSpells]);

  // Handle polling toggle
  useEffect(() => {
    const memoryReader = memoryReaderRef.current;

    if (pollingEnabled) {
      memoryReader.startPolling(POLLING_INTERVAL_MS, response => {
        setSeedState(response.state);
        setCurrentSeed(response.seed);

        // If new seed detected, call onSeedDetected
        if (response.state === "detected" && response.seed !== null && response.seed > 0) {
          onSeedDetected(response.seed.toString());
        }
      });
    } else {
      memoryReader.stopPolling();
      setIsAutoRestarting(false);
    }

    return () => {
      memoryReader.stopPolling();
    };
  }, [pollingEnabled, onSeedDetected]);

  // Auto-restart logic
  useEffect(() => {
    // Only run if polling is enabled, search is selected, and we have a valid seed
    if (!pollingEnabled || !selectedSearchUUID || currentSeed === null || currentSeed <= 0) {
      return;
    }

    // Check if we already checked this seed with this search
    if (
      lastCheckedSeedRef.current &&
      lastCheckedSeedRef.current.seed === currentSeed &&
      lastCheckedSeedRef.current.searchUUID === selectedSearchUUID
    ) {
      return;
    }

    // Mark as checked
    lastCheckedSeedRef.current = { seed: currentSeed, searchUUID: selectedSearchUUID };

    // Check if seed matches search
    const checkAndRestart = async () => {
      if (!seedMatcherRef.current) return;

      try {
        const result = await seedMatcherRef.current.checkSeedAgainstSearch(currentSeed, selectedSearchUUID);

        if (result.error) {
          // Handle errors
          if (result.error === "Search not found") {
            showError("Selected search no longer exists");
            setSelectedSearchUUID(null);
            setIsAutoRestarting(false);
          } else if (result.error === "Invalid search rules format") {
            showError(`Search rules are invalid: ${result.error}`);
            setSelectedSearchUUID(null);
            setIsAutoRestarting(false);
          } else {
            console.error("Error checking seed:", result.error);
          }
          return;
        }

        if (result.matches) {
          // Seed matches! Stop auto-restart
          setIsAutoRestarting(false);
          setConsecutiveFailures(0);
          console.log(`Seed ${currentSeed} matches search!`);
        } else {
          // Seed doesn't match, restart Noita
          console.log(`Seed ${currentSeed} doesn't match search, restarting...`);
          setIsAutoRestarting(true);
          await handleRestart();
        }
      } catch (error) {
        console.error("Error in auto-restart logic:", error);
      }
    };

    checkAndRestart().catch(console.error);
  }, [currentSeed, selectedSearchUUID, pollingEnabled]);

  const handleRestart = async () => {
    setLaunchStatus("loading");
    setErrorMessage("");

    try {
      const result = await launcherServiceRef.current.restart();

      if (result.success) {
        setLaunchStatus("success");
        setConsecutiveFailures(0);
        setTimeout(() => setLaunchStatus("idle"), 3000);
      } else {
        throw new Error(result.message || "Launch failed");
      }
    } catch (error) {
      const newFailureCount = consecutiveFailures + 1;
      setConsecutiveFailures(newFailureCount);

      setLaunchStatus("error");
      const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
      setErrorMessage(errMsg);
      setTimeout(() => setLaunchStatus("idle"), 5000);

      // Check if we've hit the failure threshold
      if (newFailureCount >= MAX_RESTART_FAILURES) {
        showError(`Failed to restart Noita ${MAX_RESTART_FAILURES} times. Last error: ${errMsg}`);
        setSelectedSearchUUID(null);
        setIsAutoRestarting(false);
        setConsecutiveFailures(0);
      }
    }
  };

  const handleManualRestart = async () => {
    if (isAutoRestarting) {
      // Stop auto-restart
      setIsAutoRestarting(false);
      setSelectedSearchUUID(null);
      lastCheckedSeedRef.current = null;
    } else {
      // Manual restart
      await handleRestart();
    }
  };

  const showError = (message: string) => {
    setErrorModalMessage(message);
    setShowErrorModal(true);
  };

  const getToggleVariant = (): string => {
    switch (seedState) {
      case "detected":
        return "success";
      case "menu":
        return "warning";
      case "not-running":
        return "secondary";
      case "error":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getButtonContent = () => {
    if (isAutoRestarting) {
      return (
        <>
          <i className="bi bi-stop-circle me-2"></i>
          Stop Auto-Restart
        </>
      );
    }

    switch (launchStatus) {
      case "loading":
        return (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Launching...
          </>
        );
      case "success":
        return (
          <>
            <i className="bi bi-check-circle me-2"></i>
            Launched
          </>
        );
      case "error":
        return (
          <>
            <i className="bi bi-exclamation-triangle me-2"></i>
            Error
          </>
        );
      default:
        return (
          <>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Restart Noita
          </>
        );
    }
  };

  const getButtonVariant = () => {
    if (isAutoRestarting) {
      return "warning";
    }

    switch (launchStatus) {
      case "success":
        return "success";
      case "error":
        return "danger";
      default:
        return "outline-danger";
    }
  };

  // Create search options with "None" as first option
  const searchOptions = useMemo(() => {
    const options = [{ uuid: "", name: "None" }];
    if (searches) {
      options.push(...searches.map(s => ({ uuid: s.uuid, name: s.config.name || "Unnamed Search" })));
    }
    return options;
  }, [searches]);

  return (
    <>
      <Stack gap={2} className="mt-3">
        {/* Polling Toggle */}
        <Stack direction="horizontal" gap={2}>
          <Form.Check
            type="switch"
            id="memory-polling-switch"
            checked={pollingEnabled}
            onChange={e => setPollingEnabled(e.target.checked)}
            className={`text-${getToggleVariant()}`}
          />
          <Form.Label htmlFor="memory-polling-switch" className="mb-0">
            Search Memory for Seed
          </Form.Label>
        </Stack>

        {/* Search Dropdown */}
        <Stack direction="horizontal" gap={2}>
          <Form.Label className="mb-0" style={{ minWidth: "140px" }}>
            Auto-Restart Search:
          </Form.Label>
          <Form.Select
            size="sm"
            value={selectedSearchUUID || ""}
            onChange={e => {
              const value = e.target.value;
              setSelectedSearchUUID(value === "" ? null : value);
              lastCheckedSeedRef.current = null;
              setIsAutoRestarting(false);
            }}
            disabled={!pollingEnabled}
          >
            {searchOptions.map(option => (
              <option key={option.uuid} value={option.uuid}>
                {option.name}
              </option>
            ))}
          </Form.Select>
        </Stack>

        {/* Restart Button */}
        <Button
          variant={getButtonVariant()}
          size="sm"
          onClick={handleManualRestart}
          disabled={launchStatus === "loading"}
        >
          {getButtonContent()}
        </Button>

        {/* Error Message */}
        {launchStatus === "error" && errorMessage && (
          <div className="p-2 bg-danger text-white rounded small">
            <i className="bi bi-exclamation-circle me-2"></i>
            {errorMessage}
          </div>
        )}
      </Stack>

      {/* Error Modal */}
      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-exclamation-triangle me-2"></i>
            Error
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{errorModalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowErrorModal(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LocalGameControl;
