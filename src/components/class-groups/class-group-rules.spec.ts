import { describe, expect, it } from "vitest";
import {
  capacityError,
  classGroupLabel,
  describeClassDays,
  endTimeOf,
  hasErrors,
  slotErrors,
  validateClassGroupForm,
  type ClassSlotDraft,
} from "@/components/class-groups/class-group-rules";

const slot = (
  key: string,
  weekDay: ClassSlotDraft["weekDay"],
  startTime: string,
) => ({
  key,
  weekDay,
  startTime,
});

describe("endTimeOf", () => {
  it("soma a duração ao início", () => {
    expect(endTimeOf("08:00", 50)).toBe("08:50");
  });

  it("não passa de 24:00", () => {
    expect(endTimeOf("23:30", 60)).toBe("24:00");
  });
});

describe("capacityError", () => {
  it.each(["", "1", "101", "2.5"])("recusa %j", (value) => {
    expect(capacityError(value)).toBeDefined();
  });

  it.each(["2", "100"])("aceita %s", (value) => {
    expect(capacityError(value)).toBeUndefined();
  });
});

describe("slotErrors", () => {
  it("pede o início do horário", () => {
    expect(slotErrors([slot("a", "MONDAY", "")], 50)).toEqual({
      a: "Informe o horário de início.",
    });
  });

  it("aponta os dois horários que se sobrepõem no mesmo dia", () => {
    const errors = slotErrors(
      [slot("a", "MONDAY", "08:00"), slot("b", "MONDAY", "08:30")],
      50,
    );
    expect(Object.keys(errors)).toEqual(["a", "b"]);
  });

  it("aceita um horário que começa quando o outro termina", () => {
    expect(
      slotErrors(
        [slot("a", "MONDAY", "08:00"), slot("b", "MONDAY", "08:50")],
        50,
      ),
    ).toEqual({});
  });

  it("não compara dias diferentes", () => {
    expect(
      slotErrors(
        [slot("a", "MONDAY", "08:00"), slot("b", "TUESDAY", "08:00")],
        50,
      ),
    ).toEqual({});
  });
});

describe("validateClassGroupForm", () => {
  const valid = {
    name: "",
    serviceId: "s",
    professionalId: "p",
    capacity: "5",
    slots: [slot("a", "MONDAY", "08:00")],
    duration: 50,
  };

  it("aceita o formulário completo, com nome vazio", () => {
    expect(hasErrors(validateClassGroupForm(valid))).toBe(false);
  });

  it("exige serviço, profissional, vagas e ao menos um horário", () => {
    const errors = validateClassGroupForm({
      ...valid,
      serviceId: "",
      professionalId: "",
      capacity: "",
      slots: [],
    });
    expect(errors.service).toBeDefined();
    expect(errors.professional).toBeDefined();
    expect(errors.capacity).toBeDefined();
    expect(errors.days).toBeDefined();
  });

  it("limita a 21 horários", () => {
    const slots = Array.from({ length: 22 }, (_, i) =>
      slot(String(i), "MONDAY", `${String(i).padStart(2, "0")}:00`),
    );
    expect(validateClassGroupForm({ ...valid, slots, duration: 30 }).days).toBe(
      "Use até 21 horários.",
    );
  });
});

describe("describeClassDays", () => {
  it("ordena por dia da semana e horário", () => {
    expect(
      describeClassDays([
        { weekDay: "THURSDAY", startTime: "09:00" },
        { weekDay: "MONDAY", startTime: "18:00" },
        { weekDay: "MONDAY", startTime: "08:00" },
      ]),
    ).toBe("Seg 08:00 · Seg 18:00 · Qui 09:00");
  });
});

describe("classGroupLabel", () => {
  it("usa o serviço quando a turma não tem nome", () => {
    expect(classGroupLabel({ name: null, service: { name: "Pilates" } })).toBe(
      "Pilates",
    );
    expect(
      classGroupLabel({ name: "Manhã", service: { name: "Pilates" } }),
    ).toBe("Manhã");
  });
});
