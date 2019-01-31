package org.apel.gaia.infrastructure.generator.id;

import org.apel.gaia.commons.autocomplete.generator.id.IdGenerator;
import org.apel.gaia.util.UUIDUtil;

public class DefaultIdGenerator implements IdGenerator{

	@Override
	public Object getId(Class<?> typeClass) {
		try {
			Object obj = typeClass.newInstance();
			if(obj instanceof String){
				return getStringId();
			}
		} catch (InstantiationException e) {
			e.printStackTrace();
		} catch (IllegalAccessException e) {
			e.printStackTrace();
		}
		return null;
	}
	
	public String getStringId(){
		return UUIDUtil.uuid();
	}
	
}
