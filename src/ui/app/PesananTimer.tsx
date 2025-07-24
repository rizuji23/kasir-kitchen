import { useState, useEffect, useCallback } from "react";
import { KitchenOrderType } from "../../electron/types";
import moment from "moment";
import { Chip } from "@heroui/react";

export default function PesananTimer({ data }: { data: KitchenOrderType }) {
    const [remainingTime, setRemainingTime] = useState<string>("00:00:00");
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [chipColor, setChipColor] = useState<"default" | "warning" | "danger">("default");

    const calculateRemainingTime = useCallback(() => {
        if (!data.start_timer || !data.end_timer) {
            setRemainingTime("00:00:00");
            setIsRunning(false);
            setChipColor("default");
            return;
        }

        const end = moment(data.end_timer);
        const now = moment();

        if (now.isAfter(end)) {
            setRemainingTime("00:00:00");
            setIsRunning(false);
            setChipColor("default");
            return;
        }

        const duration = moment.duration(end.diff(now));
        const totalMinutes = duration.asMinutes();

        // Set chip color based on remaining time
        if (totalMinutes > 10) {
            setChipColor("default"); // Normal color
        } else if (totalMinutes > 5) {
            setChipColor("warning"); // Yellow
        } else {
            setChipColor("danger"); // Red
        }

        const hours = duration.hours().toString().padStart(2, '0');
        const minutes = duration.minutes().toString().padStart(2, '0');
        const seconds = duration.seconds().toString().padStart(2, '0');

        setRemainingTime(`${hours}:${minutes}:${seconds}`);
        setIsRunning(true);
    }, [data.start_timer, data.end_timer]);

    useEffect(() => {
        calculateRemainingTime();

        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                calculateRemainingTime();
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [calculateRemainingTime, isRunning]);

    return (
        <Chip color={chipColor}>{remainingTime}</Chip>
    );
}