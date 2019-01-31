package org.apel.gaia.infrastructure.generator.id;

import org.apel.gaia.commons.autocomplete.generator.id.IdGenerator;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class IdGeneratorConfig {

	@Bean
	@ConditionalOnMissingBean
	public IdGenerator idGenerator(){
		return new DefaultIdGenerator();
	}
	
}
