import { patcher, metro, React } from "@valenced/api";

// Fetch Metro modules for navigation and UI elements
const NavigationBar = metro.findByProps("BottomTabBar", "TabBar");
const Router = metro.findByProps("transitionTo", "navigateToExtra");
const { View, Text, TouchableOpacity, StyleSheet } = metro.common.Components;

let unpatch: () => void;

export default {
    name: "RestoreTabsV2",
    description: "Rebuilds the classic 4-tab layout (Servers, DMs, Notifications, Profile) for modern Discord builds.",
    authors: [{ name: "YourName", id: "000000000000000000" }],
    version: "2.0.0",

    start() {
        if (!NavigationBar) {
            console.error("[RestoreTabsV2] Could not locate NavigationBar module.");
            return;
        }

        // Intercept and patch the main Navigation/Tab Bar render method
        unpatch = patcher.after("default", NavigationBar, (_, res) => {
            return React.createElement(CustomTabsV2Layout, { originalBar: res });
        });
    },

    stop() {
        if (unpatch) unpatch();
    }
};

/**
 * Custom 4-Tab Bottom Navigation Bar Component
 */
function CustomTabsV2Layout({ originalBar }: { originalBar: any }) {
    const [activeTab, setActiveTab] = React.useState<"servers" | "dms" | "notifications" | "you">("servers");

    const handleTabPress = (tabKey: "servers" | "dms" | "notifications" | "you", routePath: string) => {
        setActiveTab(tabKey);
        if (Router?.transitionTo) {
            Router.transitionTo(routePath);
        }
    };

    return React.createElement(
        View,
        { style: styles.container },
        // Render 4 Classic Navigation Buttons
        React.createElement(
            TouchableOpacity,
            { style: styles.tabItem, onPress: () => handleTabPress("servers", "/channels/@me") },
            React.createElement(Text, { style: [styles.label, activeTab === "servers" && styles.activeLabel] }, "Servers")
        ),
        React.createElement(
            TouchableOpacity,
            { style: styles.tabItem, onPress: () => handleTabPress("dms", "/channels/@me") },
            React.createElement(Text, { style: [styles.label, activeTab === "dms" && styles.activeLabel] }, "DMs")
        ),
        React.createElement(
            TouchableOpacity,
            { style: styles.tabItem, onPress: () => handleTabPress("notifications", "/notifications") },
            React.createElement(Text, { style: [styles.label, activeTab === "notifications" && styles.activeLabel] }, "Mentions")
        ),
        React.createElement(
            TouchableOpacity,
            { style: styles.tabItem, onPress: () => handleTabPress("you", "/users/@me") },
            React.createElement(Text, { style: [styles.label, activeTab === "you" && styles.activeLabel] }, "You")
        )
    );
}

// React Native Layout Styles
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        height: 56,
        backgroundColor: "#1e1f22",
        borderTopWidth: 1,
        borderTopColor: "#2b2d31",
        justifyContent: "space-around",
        alignItems: "center",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: "100%"
    },
    label: {
        color: "#949ba4",
        fontSize: 11,
        fontWeight: "600",
        marginTop: 2
    },
    activeLabel: {
        color: "#ffffff"
    }
});
