import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NewsStatsList } from '../../../components/admin/NewsStatsList';
import { COLORS } from '@/theme';

export default function StatsScreen() {
    return (
        <View style={styles.container}>
            <NewsStatsList />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 16
    }
}); 