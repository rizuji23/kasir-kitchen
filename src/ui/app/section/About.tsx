import { Alert } from "@heroui/alert";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useEffect, useState } from "react";

export default function AboutPage() {
    // const [versionInfo, setVersionInfo] = useState<string>("");
    // const [changelog, setChangelog] = useState<string>("");
    // const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);
    // const [isUpdateDownloaded, setIsUpdateDownloaded] = useState<boolean>(false);
    // const [downloadProgress, setDownloadProgress] = useState<number>(0);
    const [currentVersion, setCurrentVersion] = useState<string>("");
    // const [isDownloading, setIsDownloading] = useState<boolean>(false);

    // // Handle "Check for Updates"
    // const handleCheckForUpdates = () => {
    //     window.update.checkForUpdates();
    // };

    // // Handle "Update Now" or "Restart & Install"
    // const handleUpdateNow = () => {
    //     if (isUpdateDownloaded) {
    //         console.log("Installing update...");
    //         window.update.quitAndInstall();
    //     } else {
    //         console.log("Downloading update...");
    //         window.update.downloadUpdate();
    //     }
    // };

    useEffect(() => {
        // handleCheckForUpdates();
        const curr = window.update.get_version();
        setCurrentVersion(curr);
    }, []);

    const handleOpenExternal = async (url: string) => {
        await window.api.open_url(url);
    };

    // useEffect(() => {
    //     // Listen for update available
    //     window.update.onUpdateAvailable((info) => {
    //         console.log("Update available:", info);
    //         setVersionInfo(`Versi baru tersedia: ${info.version}`);
    //         setChangelog(info.releaseNotes);
    //         setIsUpdateAvailable(true);
    //         setIsUpdateDownloaded(false);
    //     });

    //     // Listen for no update available
    //     window.update.onUpdateNotAvailable(() => {
    //         console.log("No update available.");
    //         setVersionInfo("Tidak ada pembaruan yang tersedia.");
    //         setChangelog("");
    //         setIsUpdateAvailable(false);
    //         setIsDownloading(false);
    //     });

    //     // Listen for update downloaded
    //     window.update.onUpdateDownloaded(() => {
    //         console.log("Update downloaded, enabling restart button.");
    //         setVersionInfo("Pembaruan telah diunduh. Mulai ulang aplikasi untuk menerapkan pembaruan.");
    //         setIsUpdateAvailable(false);
    //         setIsUpdateDownloaded(true);
    //         setIsDownloading(false);
    //         setDownloadProgress(100);
    //     });

    //     // Listen for update error
    //     window.update.onUpdateError((error) => {
    //         console.error("Update error:", error);
    //         setVersionInfo("Terjadi kesalahan saat memeriksa pembaruan.");
    //         setChangelog(error.message);
    //         setIsUpdateAvailable(false);
    //         setIsDownloading(false);
    //     });

    //     // Listen for download progress
    //     window.update.onDownloadProgress((progress) => {
    //         console.log(`Downloading... ${progress.percent}%`);
    //         setIsDownloading(true);
    //         setDownloadProgress(progress.percent);
    //     });
    // }, []);

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
                        <Alert color="warning" title={"Informasi Pembaharuan"} description={
                            <>
                                <div className="flex flex-col gap-3">
                                    <p>Update akan diupload pada url berikut ini: <button className="font-bold underline" onClick={() => handleOpenExternal("https://updatecozypool.rlstudio.my.id")}>updatecozypool.rlstudio.my.id</button></p>
                                    <div>
                                        <p>Dengan Akun sebagai berikut:</p>
                                        <ul className="list-disc list-inside ml-3 mt-1">
                                            <li>Username: <b>user</b></li>
                                            <li>Password: <b>cozypool2025</b></li>
                                        </ul>
                                    </div>
                                </div>
                            </>
                        } />
                        {/* {isUpdateAvailable && (
                            <>
                                <Alert color="secondary" title="Pembaharuan" description={versionInfo} />
                                <div className="grid gap-2">
                                    <p className="text-sm font-bold">Changelog:</p>
                                    <div className="bg-slate-500/50 rounded-md p-3">
                                        <div className="text-sm">{changelog || "-"}</div>
                                    </div>
                                </div>
                            </>
                        )}

                        {!isDownloading && (
                            <Alert
                                color="danger"
                                title="Pemberitahuan"
                                description={<span>Jika Anda melakukan <b>Restart & Install</b>, maka billing akan terhenti dan aplikasi akan tertutup.</span>}
                            />
                        )}

                        {isDownloading && (
                            <div className="w-full p-3 bg-slate-500/50 rounded-md flex flex-col gap-2">
                                <p>Downloading Update: <b>{downloadProgress.toFixed(2)}%</b></p>
                                <Progress maxValue={100} value={downloadProgress} className="w-full" />
                            </div>
                        )}

                        {isUpdateDownloaded ? (
                            <Button
                                color="primary"
                                onPress={handleUpdateNow}
                                startContent={<MonitorUp className="w-4 h-4" />}
                            >
                                Restart & Install
                            </Button>
                        ) : isUpdateAvailable ? (
                            <Button
                                color="primary"
                                onPress={async () => {
                                    const confirm = await window.api.confirm();
                                    if (confirm) {
                                        handleUpdateNow();
                                    }
                                }}
                                isDisabled={isDownloading}
                                startContent={<MonitorUp className="w-4 h-4" />}
                            >
                                Update Sekarang
                            </Button>
                        ) : (
                            <Button
                                color="primary"
                                onPress={handleCheckForUpdates}
                                startContent={<MonitorUp className="w-4 h-4" />}
                            >
                                Check Update
                            </Button>
                        )} */}
                    </div>
                </CardBody>
            </Card>
        </>
    );
}
