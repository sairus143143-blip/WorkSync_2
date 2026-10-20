import React from "react";
import { CircleAlertIcon, CircleCheckIcon, CircleXIcon, ClockIcon, HourglassIcon, PlaneIcon, BoxIcon } from "lucide-react";
import { AttendanceStatus } from "../../types/attendance";
import { BadgeTone } from "../../types/ui";
import { ATTENDANCE_STATUS_LABELS } from "../../utils/attendance";
import { Badge } from "../ui/Badge";
export const attendanceStatusMeta: Record<AttendanceStatus, {
  tone: BadgeTone;
  icon: BoxIcon;
}> = {
  present: {
    tone: 'success',
    icon: CircleCheckIcon
  },
  late: {
    tone: 'warning',
    icon: ClockIcon
  },
  absent: {
    tone: 'danger',
    icon: CircleXIcon
  },
  on_leave: {
    tone: 'info',
    icon: PlaneIcon
  },
  half_day: {
    tone: 'primary',
    icon: HourglassIcon
  },
  incomplete: {
    tone: 'neutral',
    icon: CircleAlertIcon
  }
};

/** Status label with an icon, so meaning never depends on color alone. */
export function AttendanceStatusBadge({
  status


}: {status: AttendanceStatus;}) {
  const {
    tone,
    icon: Icon
  } = attendanceStatusMeta[status];
  return <Badge tone={tone}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {ATTENDANCE_STATUS_LABELS[status]}
    </Badge>;
}