import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

const SimplePaginator = ({ totalPages, currentPage, onPageChange }) => {
  return (
    <View style={styles.paginator}>
      {[...Array(totalPages).keys()].map((pageNumber) => (
        <View
          key={pageNumber}
          style={[
            styles.dot,
            pageNumber === currentPage && styles.activeDot,
          ]}
          onPress={() => onPageChange(pageNumber)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  paginator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e8e8e8',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: 'black',
  },
});

export default SimplePaginator;
