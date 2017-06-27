/*
 * Copyright © WebServices pour l'Éducation, 2017
 *
 * This file is part of ENT Core. ENT Core is a versatile ENT engine based on the JVM.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation (version 3 of the License).
 *
 * For the sake of explanation, any module that communicate over native
 * Web protocols, such as HTTP, with ENT Core is outside the scope of this
 * license and could be license under its own terms. This is merely considered
 * normal use of ENT Core, and does not fall under the heading of "covered work".
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

package fr.openent.diary.utils;

import com.samskivert.mustache.Mustache;
import com.samskivert.mustache.Template;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.Utils;
import fr.wseduc.webutils.http.Renders;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.io.IOException;
import java.io.Writer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentMap;

public final class DiaryLambda {

	private static final Logger log = LoggerFactory.getLogger(DiaryLambda.class);

	private DiaryLambda() {}

	public static void setLambdaTemplateRequest(final HttpServerRequest request, final Map<String, Object> ctx){
												//,final ConcurrentMap<String, String> eventsI18n, final HashMap<String, JsonObject> lazyEventsI18n) {

		ctx.put("unicode", new Mustache.Lambda() {
			@Override
			public void execute(Template.Fragment frag, Writer out) throws IOException {
				Mustache.compiler().compile(StringUtils.unicode(frag.execute())).execute(ctx, out);
			}
		});

	}

}
