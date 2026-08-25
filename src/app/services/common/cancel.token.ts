// cancel.token.ts
import { HttpContextToken } from "@angular/common/http";

export const CANCEL_SIGNAL = new HttpContextToken<AbortSignal | null>(() => null);