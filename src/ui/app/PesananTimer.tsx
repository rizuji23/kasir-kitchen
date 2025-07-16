import { useState, useEffect, useCallback } from "react";
import { KitchenOrderType } from "../../electron/types";
import moment from "moment";
import { Chip } from "@heroui/react";

export default function PesananTimer({ data }: { data: KitchenOrderType }) {
    const [remainingTime, setRemainingTime] = useState<string>("00:00:00");
    const [isRunning, setIsRunning] = useState<boolean>(false);

    const calculateRemainingTime = useCallback(() => {
        if (!data.start_timer || !data.end_timer) {
            setRemainingTime("00:00:00");
            return;
        }

        const end = moment(data.end_timer);
        const now = moment();

        if (now.isAfter(end)) {
            setRemainingTime("00:00:00");
            setIsRunning(false);
            return;
        }

        const duration = moment.duration(end.diff(now));
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
        <Chip>{remainingTime}</Chip>
    );
}