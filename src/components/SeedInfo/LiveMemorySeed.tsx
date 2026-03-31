import React, { useEffect, useState, useCallback, useRef } from "react";
import { Button, Card, Stack, Alert } from "react-bootstrap";

interface ILiveMemorySeedProps {
  onSeedDetected(seed: string): void;
}

interface ISeedResponse {
  seed: number | null;
  error: string | null;
}

const LiveMemorySeed: React.FC<ILiveMemorySeedProps> = ({ onSeedDetected }) => {
  const [currentSeed, setCurrentSeed] = useState<number | null>(null);
  const [previousSeed, setPreviousSeed] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSeed = useCallback(async () => {
    try {
      const response = await fetch("/api/noita/current-seed");
      const data: ISeedResponse = await response.json();

      if (data.error) {
        setError(data.error);
        setCurrentSeed(null);
      } else if (data.seed !== null && data.seed !== 0) {
        // If this is a new seed, automatically submit it
        if (data.seed !== previousSeed) {
          setCurrentSeed(data.seed);
          setPreviousSeed(data.seed);
          setError(null);
          setLastUpdate(new Date());
          // Automatically submit the new seed
          onSeedDetected(data.seed.toString());
        } else {
          // Just update the display, seed hasn't changed
          setCurrentSeed(data.seed);
          setError(null);
          setLastUpdate(new Date());
        }
      } else if (data.seed === 0) {
        setCurrentSeed(0);
        setError("Seed is 0 - are you still in the main menu?");
      }
    } catch (err) {
      console.error("Error fetching Noita seed:", err);
      setError("Failed to connect to server");
      setCurrentSeed(null);
    }
  }, [previousSeed, onSeedDetected]);

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    fetchSeed();

    // Set up auto-refresh every 5 seconds
    intervalRef.current = setInterval(() => {
      fetchSeed();
    }, 5000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchSeed]);

  return (
    <Card className="mt-3">
      <Card.Header>
        <Stack direction="horizontal" gap={2}>
          <span>Live Seed from Noita Memory</span>
        </Stack>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="warning" className="mb-3">
            {error}
          </Alert>
        )}

        {currentSeed !== null && currentSeed !== 0 && (
          <div className="mb-3">
            <h5 className="mb-2">Current Seed: {currentSeed}</h5>
            {lastUpdate && <small className="text-muted">Last updated: {lastUpdate.toLocaleTimeString()}</small>}
          </div>
        )}

        <div className="mt-2">
          <small className="text-muted">Auto-refreshes every 5 seconds</small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LiveMemorySeed;
