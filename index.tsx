import { findByProps } from "@valenced/webpack";
import { patcher } from "@valenced/patcher";
// Import React Native components exported by Discord's Metro bundle
const { View, Text, TouchableOpacity } = findByProps("TouchableOpacity", "View");
const Navigation = findByProps("transitionTo", "openModal");

// Locate Discord mobile's main app shell container
const AppView = findByProps("AppView") ?? findByProps("RootContainer");

export default {
    onStart() {
        if (!AppView) return;

        // Patch the root app layout to append custom bottom tabs
        patcher.after("RestoreTabsV2", AppView, "default", (_, args, res) => {
            if (!res?.props) return res;

            // Inject custom tab bar component at the bottom of the layout
            const customTabBar = (
                <View style={{ flexDirection: "row", height: 56, backgroundColor: "#1e1f22", justifyContent: "space-around", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => Navigation.transitionTo("/channels/@me")}>
                        <Text style={{ color: "#fff" }}>DMs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Navigation.transitionTo("/guilds")}>
                        <Text style={{ color: "#fff" }}>Servers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Navigation.transitionTo("/settings")}>
                        <Text style={{ color: "#fff" }}>You</Text>
                    </TouchableOpacity>
                </View>
            );

            // Append to the root view children
            if (Array.isArray(res.props.children)) {
                res.props.children.push(customTabBar);
            }

            return res;
        });
    },

    onStop() {
        patcher.unpatchAll("RestoreTabsV2");
    }
};
