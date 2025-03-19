import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/react";
import { MonitorUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function UpdatePage() {
    const [versionInfo, setVersionInfo] = useState<string>("");
    const [changelog, setChangelog] = useState<string>("");
    const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);
    const [isUpdateDownloaded, setIsUpdateDownloaded] = useState<boolean>(false);
    const [downloadProgress, setDownloadProgress] = useState<number>(0); // Progress in percentage
    const [currentVersion, setCurrentVersion] = useState<string>("");
    const [isNowDownloaded, setisNowDownloaded] = useState<boolean>(false);

    // Handle "Check for Updates" button click
    const handleCheckForUpdates = () => {
        window.update.checkForUpdates();
    };

    // Handle "Update Now" or "Restart & Install" button click
    const handleUpdateNow = () => {
        if (isUpdateDownloaded) {
            window.update.quitAndInstall(); // Restart and install the update
        } else {
            window.update.downloadUpdate(); // Download the update
        }
    };

    useEffect(() => {
        handleCheckForUpdates();
        const curr = window.update.get_version();
        setCurrentVersion(curr);
    }, [])

    // Set up listeners for update events
    useEffect(() => {
        // Listen for update available
        window.update.onUpdateAvailable((info) => {
            setVersionInfo(`Versi baru tersedia: ${info.version}`);
            setChangelog(info.releaseNotes);
            setIsUpdateAvailable(true);
            setIsUpdateDownloaded(false);
        });

        // Listen for no update available
        window.update.onUpdateNotAvailable(() => {
            setVersionInfo("Tidak ada pembaruan yang tersedia.");
            setChangelog("");
            setIsUpdateAvailable(false);
            setisNowDownloaded(false);
        });

        // Listen for update downloaded
        window.update.onUpdateDownloaded(() => {
            setVersionInfo("Pembaruan telah diunduh. Mulai ulang aplikasi untuk menerapkan pembaruan.");
            setIsUpdateDownloaded(true);
            setDownloadProgress(100); // Set progress to 100% when download is complete
            setisNowDownloaded(false);
        });

        // Listen for update error
        window.update.onUpdateError((error) => {
            setVersionInfo("Terjadi kesalahan saat memeriksa pembaruan.");
            setChangelog(error.message);
            setIsUpdateAvailable(false);
            setisNowDownloaded(false);
        });

        // Listen for download progress
        window.update.onDownloadProgress((progress) => {
            setisNowDownloaded(true)
            setDownloadProgress(progress.percent); // Update progress state
        });
    }, []);


    return (
        <>
            <Card>
                <CardBody>
                    <div className="grid gap-3">
                        <div className="flex flex-col gap-3">
                            <div className="grid gap-3">
                                <h3 className="font-bold text-lg">Versi Aplikasi:</h3>
                                <Chip color="success" classNames={{ content: "font-bold" }}>v{currentVersion}</Chip>
                            </div>
                        </div>
                        {
                            isUpdateAvailable && (
                                <>
                                    <Alert color="secondary" title="Pembaharuan" description={versionInfo} />
                                    <div className="grid gap-2">
                                        <p className="text-sm font-bold">Changelog:</p>
                                        <div className="bg-slate-500/50 rounded-md p-3">
                                            <div className="text-sm">{changelog || "-"}</div>
                                        </div>
                                    </div>
                                </>
                            )
                        }

                        {
                            !isNowDownloaded && (<Alert color="danger" title="Pemberitahuan" description={<span>Jika anda melakukan <b>Restart & Install</b> maka billing akan terhenti dan aplikasi akan tertutup.</span>} />)
                        }

                        {
                            isNowDownloaded && (
                                <div className="w-full p-3 bg-slate-500/50 rounded-md flex flex-col gap-2">
                                    <p>Downloading Update: <b>{downloadProgress.toFixed(2)}%</b></p>
                                    <Progress maxValue={100} value={downloadProgress} className="w-full" />
                                </div>
                            )
                        }

                        {
                            isUpdateAvailable ? <Button color="primary" onPress={async () => {
                                const confirm = window.api.confirm();
                                if (await confirm) {
                                    handleUpdateNow();
                                }
                            }} isDisabled={isNowDownloaded} startContent={<MonitorUp className="w-4 h-4" />} >{isUpdateDownloaded ? "Restart & Install" : "Update Sekarang"}</Button> : <Button color="primary" onPress={handleCheckForUpdates} startContent={<MonitorUp className="w-4 h-4" />}>Check Update</Button>
                        }
                    </div>
                </CardBody>
            </Card>
        </>
    )
}