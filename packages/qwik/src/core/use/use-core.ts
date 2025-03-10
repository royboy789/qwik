import { _getContainerState } from '../container/container';
import type { QwikDocument } from '../document';
import { assertDefined } from '../error/assert';
import { qError, QError_useInvokeContext, QError_useMethodOutsideContext } from '../error/error';
import type { QRLInternal } from '../qrl/qrl-class';
import type { QRL } from '../qrl/qrl.public';
import type { QwikElement } from '../render/dom/virtual-element';
import type { RenderContext } from '../render/types';
import { getContext, HOST_FLAG_DYNAMIC } from '../state/context';
import { QContainerSelector, QLocaleAttr, RenderEvent } from '../util/markers';
import { isPromise } from '../util/promises';
import { seal } from '../util/qdev';
import { isArray } from '../util/types';
import { setLocale } from './use-locale';
import type { SubscriberEffect, SubscriberHost } from './use-task';

declare const document: QwikDocument;

export interface StyleAppend {
  styleId: string;
  content: string | null;
}

export interface RenderInvokeContext extends InvokeContext {
  $url$: URL;
  $seq$: number;
  $doc$: Document;
  $hostElement$: QwikElement;
  $element$: Element;
  $event$: any;
  $qrl$: QRL<any>;
  $waitOn$: Promise<any>[];
  $subscriber$: SubscriberEffect | SubscriberHost | null;
  $renderCtx$: RenderContext;
}

export type InvokeTuple = [Element, Event, URL?];

export interface InvokeContext {
  $url$: URL | undefined;
  $seq$: number;
  $hostElement$: QwikElement | undefined;
  $element$: Element | undefined;
  $event$: any | undefined;
  $qrl$: QRL<any> | undefined;
  $waitOn$: Promise<any>[] | undefined;
  $subscriber$: SubscriberEffect | SubscriberHost | null | undefined;
  $renderCtx$: RenderContext | undefined;
  $locale$: string | undefined;
}

let _context: InvokeContext | undefined;

/**
 * @alpha
 */
export const tryGetInvokeContext = (): InvokeContext | undefined => {
  if (!_context) {
    const context = typeof document !== 'undefined' && document && document.__q_context__;
    if (!context) {
      return undefined;
    }
    if (isArray(context)) {
      return (document.__q_context__ = newInvokeContextFromTuple(context as any));
    }
    return context as InvokeContext;
  }
  return _context;
};

export const getInvokeContext = (): InvokeContext => {
  const ctx = tryGetInvokeContext();
  if (!ctx) {
    throw qError(QError_useMethodOutsideContext);
  }
  return ctx;
};

export const useInvokeContext = (): RenderInvokeContext => {
  const ctx = tryGetInvokeContext();
  if (!ctx || ctx.$event$ !== RenderEvent) {
    throw qError(QError_useInvokeContext);
  }
  assertDefined(ctx.$hostElement$, `invoke: $hostElement$ must be defined`, ctx);
  assertDefined(ctx.$waitOn$, `invoke: $waitOn$ must be defined`, ctx);
  assertDefined(ctx.$renderCtx$, `invoke: $renderCtx$ must be defined`, ctx);
  assertDefined(ctx.$subscriber$, `invoke: $subscriber$ must be defined`, ctx);

  return ctx as any;
};

export const useBindInvokeContext = <T extends ((...args: any[]) => any) | undefined>(
  callback: T
): T => {
  if (callback == null) {
    return callback;
  }
  const ctx = getInvokeContext();
  return ((...args: any[]) => {
    return invoke(ctx, callback.bind(undefined, ...args));
  }) as T;
};
export const invoke = <ARGS extends any[] = any[], RET = any>(
  context: InvokeContext | undefined,
  fn: (...args: ARGS) => RET,
  ...args: ARGS
): RET => {
  const previousContext = _context;
  let returnValue: RET;
  try {
    _context = context;
    returnValue = fn.apply(null, args);
  } finally {
    _context = previousContext;
  }
  return returnValue;
};

export const waitAndRun = (ctx: RenderInvokeContext, callback: () => any) => {
  const waitOn = ctx.$waitOn$;
  if (waitOn.length === 0) {
    const result = callback();
    if (isPromise(result)) {
      waitOn.push(result);
    }
  } else {
    waitOn.push(Promise.all(waitOn).then(callback));
  }
};

export const newInvokeContextFromTuple = (context: InvokeTuple) => {
  const element = context[0];
  const container = element.closest(QContainerSelector);
  const locale = container?.getAttribute(QLocaleAttr) || undefined;
  locale && setLocale(locale);
  return newInvokeContext(locale, undefined, element, context[1], context[2]);
};

export const newInvokeContext = (
  locale?: string,
  hostElement?: QwikElement,
  element?: Element,
  event?: any,
  url?: URL
): InvokeContext => {
  const ctx = {
    $seq$: 0,
    $hostElement$: hostElement,
    $element$: element,
    $event$: event,
    $url$: url,
    $qrl$: undefined,
    $props$: undefined,
    $renderCtx$: undefined,
    $subscriber$: undefined,
    $waitOn$: undefined,
    $locale$: locale,
  };
  seal(ctx);
  return ctx;
};

export const getWrappingContainer = (el: QwikElement): Element | null => {
  return el.closest(QContainerSelector);
};

/**
 * @alpha
 */
export const untrack = <T>(fn: () => T): T => {
  return invoke(undefined, fn);
};

/**
 * @internal
 */
export const _getContextElement = (): unknown => {
  const iCtx = tryGetInvokeContext();
  if (iCtx) {
    return (
      iCtx.$element$ ?? iCtx.$hostElement$ ?? (iCtx.$qrl$ as QRLInternal)?.$setContainer$(undefined)
    );
  }
};

/**
 * @internal
 */
export const _jsxBranch = (input?: any) => {
  const iCtx = tryGetInvokeContext();
  if (iCtx && iCtx.$hostElement$ && iCtx.$renderCtx$) {
    const hostElement = iCtx.$hostElement$;
    const elCtx = getContext(hostElement, iCtx.$renderCtx$.$static$.$containerState$);
    elCtx.$flags$ |= HOST_FLAG_DYNAMIC;
  }
  return input;
};
