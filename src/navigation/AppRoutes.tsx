import React from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../theme/colors";
import { RootStackParamList } from "./types";

import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import AlunosListScreen from "../screens/AlunosListScreen";
import ProfessoresListScreen from "../screens/ProfessoresListScreen";
import BoletimScreen from "../screens/BoletimScreen";
import CadastroAlunoScreen from "../screens/CadastroAlunoScreen";
import CadastroProfessorScreen from "../screens/CadastroProfessorScreen";
import DisciplinasListScreen from "../screens/DisciplinasListScreen";
import DisciplinaDetailScreen from "../screens/DisciplinaDetailScreen";
import CreateDisciplinaScreen from "../screens/CreateDisciplinaScreen";
import SelecionarProfessorScreen from "../screens/SelecionarProfessorScreen";
import AdicionarAlunoDisciplinaScreen from "../screens/AdicionarAlunoDisciplinaScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="AlunosList" component={AlunosListScreen} />
          <Stack.Screen
            name="ProfessoresList"
            component={ProfessoresListScreen}
          />
          <Stack.Screen name="Boletim" component={BoletimScreen} />
          <Stack.Screen name="CadastroAluno" component={CadastroAlunoScreen} />
          <Stack.Screen
            name="CadastroProfessor"
            component={CadastroProfessorScreen}
          />
          <Stack.Screen
            name="DisciplinasList"
            component={DisciplinasListScreen}
          />
          <Stack.Screen
            name="DisciplinaDetail"
            component={DisciplinaDetailScreen}
          />
          <Stack.Screen
            name="CreateDisciplina"
            component={CreateDisciplinaScreen}
          />
          <Stack.Screen
            name="SelecionarProfessor"
            component={SelecionarProfessorScreen}
          />
          <Stack.Screen
            name="AdicionarAlunoDisciplina"
            component={AdicionarAlunoDisciplinaScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
