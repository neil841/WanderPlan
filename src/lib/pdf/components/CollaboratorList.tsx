/**
 * PDF Collaborator List Component
 *
 * Lists all trip collaborators
 */

import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  collaborator: {
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    border: '1px solid #e2e8f0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  email: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  role: {
    fontSize: 9,
    color: '#3b82f6',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  creator: {
    fontSize: 8,
    color: '#059669',
    marginTop: 2,
  },
});

interface Collaborator {
  id: string;
  role: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface CollaboratorListProps {
  collaborators: Collaborator[];
  creatorName: string;
}

export function CollaboratorList({ collaborators, creatorName }: CollaboratorListProps) {
  if (collaborators.length === 0) {
    return null;
  }

  return (
    <View style={styles.section} break>
      <Text style={styles.title}>👥 Trip Collaborators</Text>

      {collaborators.map((collaborator) => (
        <View key={collaborator.id} style={styles.collaborator}>
          <View style={styles.row}>
            <View>
              <Text style={styles.name}>
                {collaborator.user.firstName} {collaborator.user.lastName}
              </Text>
              <Text style={styles.email}>{collaborator.user.email}</Text>
            </View>
            <Text style={styles.role}>{collaborator.role}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.creator}>
        Trip created by: {creatorName}
      </Text>
    </View>
  );
}
