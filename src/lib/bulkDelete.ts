import Axios from "../Axios";

type BulkEntity = "student" | "class" | "teacher";

type BulkConfig = {
  endpoint: string;
  key: "studentIds" | "classIds" | "teacherIds";
};

const bulkConfig: Record<BulkEntity, BulkConfig> = {
  student: {
    endpoint: "/student/bulk",
    key: "studentIds",
  },
  class: {
    endpoint: "/class/bulk",
    key: "classIds",
  },
  teacher: {
    endpoint: "/teacher/bulk",
    key: "teacherIds",
  },
};

export const bulkDelete = async (entity: BulkEntity, ids: string[]) => {
  const config = bulkConfig[entity];
  const { data } = await Axios.delete(config.endpoint, {
    data: {
      [config.key]: ids,
    },
  });

  return data;
};

export const deleteAttendance = async (payload: Record<string, any>) => {
  const { data } = await Axios.delete("/attendance/delete", {
    data: payload,
  });

  return data;
};

export const authorizeAttendanceDelete = async (password: string) => {
  const { data } = await Axios.post("/attendance/delete/authorize", {
    password,
  });

  return data;
};

export const formatDeleteSummary = (
  data: any,
  fallbackCount: number,
  singularLabel: string,
  pluralLabel: string
) => {
  const deletedCount = data?.deletedCount ?? fallbackCount;
  const label = deletedCount === 1 ? singularLabel : pluralLabel;
  const summaryText = data?.summary
    ? typeof data.summary === "string"
      ? ` ${data.summary}`
      : ` ${JSON.stringify(data.summary)}`
    : "";

  return `Deleted ${deletedCount} ${label}.${summaryText}`;
};
