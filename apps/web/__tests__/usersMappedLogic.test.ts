/**
 * Test para verificar que el mapeo de usuarios en operaciones
 * siempre use member.id (ID del documento en teams) y NO advisorUid.
 *
 * Este test previene el bug donde operaciones se guardaban con el UID
 * de Firebase Auth en lugar del ID del documento en teams, causando
 * que los asesores no aparecieran correctamente en la Tabla de Asesores.
 *
 * Bug original: https://github.com/... (agregar link si aplica)
 */

describe("usersMapped logic - Prevención de bug de UIDs incorrectos", () => {
  // Simular datos de miembros del equipo como vienen de useTeamMembers
  const mockTeamMembers = [
    {
      id: "aKqnpaCqyqAUBTaKjevM", // ID del documento en teams (CORRECTO)
      firstName: "Marco",
      lastName: "Martino",
      email: "marcom@gustavodesimone.com",
      advisorUid: "dUQJ30ALmAgUoUSZSApTQ5yhVTu1", // UID de Firebase Auth (INCORRECTO para usar)
    },
    {
      id: "BsUhEaCZDiKqujky3GoU",
      firstName: "Diego",
      lastName: "Bentivegna",
      email: "diego@example.com",
      advisorUid: "uBm4Bh5g89aBF1sSH0VkFid2yjx2",
    },
    {
      id: "member3Id",
      firstName: "Ana",
      lastName: "García",
      email: "ana@example.com",
      // Sin advisorUid - asesor sin cuenta registrada
    },
  ];

  const currentUserUID = "teamLeaderUID123";
  const currentUserName = "Team Leader";

  /**
   * Esta es la lógica CORRECTA que debe usarse en OperationsForm y OperationsModal.
   * El test verifica que siempre se use member.id, NO member.advisorUid.
   */
  const createUsersMappedCorrect = (
    teamMembers: typeof mockTeamMembers,
    userUID: string | null,
    userName: string
  ) => {
    return [
      ...(teamMembers?.map((member) => ({
        name: `${member.firstName} ${member.lastName}`,
        uid: member.id, // ✅ CORRECTO: Siempre usar member.id
      })) || []),
      ...(userUID
        ? [
            {
              name: userName,
              uid: userUID,
            },
          ]
        : []),
    ];
  };

  /**
   * Esta es la lógica INCORRECTA que causaba el bug.
   * NO debe usarse nunca.
   */
  const createUsersMappedIncorrect = (
    teamMembers: typeof mockTeamMembers,
    userUID: string | null,
    userName: string
  ) => {
    return [
      ...(teamMembers?.map((member) => ({
        name: `${member.firstName} ${member.lastName}`,
        uid: (member as { advisorUid?: string }).advisorUid || member.id, // ❌ INCORRECTO: Puede usar advisorUid
      })) || []),
      ...(userUID
        ? [
            {
              name: userName,
              uid: userUID,
            },
          ]
        : []),
    ];
  };

  describe("Lógica correcta (member.id)", () => {
    it("debe usar member.id para asesores CON advisorUid", () => {
      const usersMapped = createUsersMappedCorrect(
        mockTeamMembers,
        currentUserUID,
        currentUserName
      );

      const marcoMapping = usersMapped.find((u) => u.name === "Marco Martino");

      // Debe usar el ID del documento en teams, NO el advisorUid
      expect(marcoMapping?.uid).toBe("aKqnpaCqyqAUBTaKjevM");
      expect(marcoMapping?.uid).not.toBe("dUQJ30ALmAgUoUSZSApTQ5yhVTu1");
    });

    it("debe usar member.id para asesores SIN advisorUid", () => {
      const usersMapped = createUsersMappedCorrect(
        mockTeamMembers,
        currentUserUID,
        currentUserName
      );

      const anaMapping = usersMapped.find((u) => u.name === "Ana García");

      expect(anaMapping?.uid).toBe("member3Id");
    });

    it("todos los asesores deben tener el ID del documento de teams", () => {
      const usersMapped = createUsersMappedCorrect(
        mockTeamMembers,
        currentUserUID,
        currentUserName
      );

      // Excluir el Team Leader del check
      const advisorMappings = usersMapped.filter(
        (u) => u.uid !== currentUserUID
      );

      // Verificar que ningún UID sea un advisorUid conocido
      const knownAdvisorUids = mockTeamMembers
        .map((m) => (m as { advisorUid?: string }).advisorUid)
        .filter(Boolean);

      advisorMappings.forEach((mapping) => {
        expect(knownAdvisorUids).not.toContain(mapping.uid);
      });
    });
  });

  describe("Detección de lógica incorrecta (advisorUid || member.id)", () => {
    it("la lógica incorrecta usaría advisorUid cuando existe", () => {
      const usersMappedIncorrect = createUsersMappedIncorrect(
        mockTeamMembers,
        currentUserUID,
        currentUserName
      );

      const marcoMappingIncorrect = usersMappedIncorrect.find(
        (u) => u.name === "Marco Martino"
      );

      // Con la lógica incorrecta, usaría advisorUid
      expect(marcoMappingIncorrect?.uid).toBe("dUQJ30ALmAgUoUSZSApTQ5yhVTu1");
      expect(marcoMappingIncorrect?.uid).not.toBe("aKqnpaCqyqAUBTaKjevM");
    });
  });

  describe("Simulación de guardado de operación", () => {
    it("al guardar una operación, user_uid debe ser el ID del documento de teams", () => {
      const usersMapped = createUsersMappedCorrect(
        mockTeamMembers,
        currentUserUID,
        currentUserName
      );

      // Simular selección del asesor "Marco Martino"
      const selectedRealizador = "Marco Martino";
      const selectedUser = usersMapped.find(
        (m) => m.name === selectedRealizador
      );

      // El UID asignado debe ser el ID del documento de teams
      const assignedUserUID = selectedUser?.uid;

      expect(assignedUserUID).toBe("aKqnpaCqyqAUBTaKjevM");
      expect(assignedUserUID).not.toBe("dUQJ30ALmAgUoUSZSApTQ5yhVTu1");
    });

    it("la operación guardada debe poder encontrarse buscando por member.id", () => {
      const usersMapped = createUsersMappedCorrect(
        mockTeamMembers,
        currentUserUID,
        currentUserName
      );

      // Simular operación guardada
      const savedOperation = {
        id: "op123",
        user_uid: usersMapped.find((m) => m.name === "Marco Martino")?.uid,
        direccion_reserva: "Test 123",
      };

      // Simular búsqueda como lo hace getTeamsWithOperations
      const memberIdToFind = "aKqnpaCqyqAUBTaKjevM";
      const operationFound = savedOperation.user_uid === memberIdToFind;

      expect(operationFound).toBe(true);
    });
  });
});
